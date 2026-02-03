import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export interface SocketUser {
  userId: string;
  role: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
  fileUrl?: string;
  fileName?: string;
}

export class SocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        credentials: true,
      },
      path: '/socket.io',
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('🔌 New socket connection:', socket.id);

      // Handle user authentication
      socket.on('authenticate', async (data: { userId: string; role: string; email: string }) => {
        try {
          // Store user socket mapping
          this.userSockets.set(data.userId, socket.id);
          socket.data.user = data;

          // Join user's personal room
          socket.join(`user:${data.userId}`);

          // Join role-based room
          socket.join(`role:${data.role.toLowerCase()}`);

          console.log(`✅ User authenticated: ${data.email} (${data.role})`);

          // Emit online status
          this.io?.emit('user:online', {
            userId: data.userId,
            role: data.role,
          });

          // Send authentication success
          socket.emit('authenticated', {
            success: true,
            userId: data.userId,
          });
        } catch (error) {
          console.error('❌ Authentication error:', error);
          socket.emit('authenticated', {
            success: false,
            error: 'Authentication failed',
          });
        }
      });

      // Handle joining chat rooms
      socket.on('join:chat', (data: { patientId: string; doctorId: string }) => {
        const roomId = this.getChatRoomId(data.patientId, data.doctorId);
        socket.join(roomId);
        console.log(`💬 User joined chat room: ${roomId}`);

        socket.emit('chat:joined', { roomId });
      });

      // Handle leaving chat rooms
      socket.on('leave:chat', (data: { patientId: string; doctorId: string }) => {
        const roomId = this.getChatRoomId(data.patientId, data.doctorId);
        socket.leave(roomId);
        console.log(`👋 User left chat room: ${roomId}`);
      });

      // Handle sending messages
      socket.on('message:send', async (message: ChatMessage) => {
        try {
          const user = socket.data.user as SocketUser;
          if (!user) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
          }

          // Determine room based on sender/receiver
          const roomId = this.getChatRoomId(
            user.role === 'PATIENT' ? user.userId : message.receiverId,
            user.role === 'DOCTOR' ? user.userId : message.receiverId
          );

          // Emit message to room
          this.io?.to(roomId).emit('message:received', {
            ...message,
            timestamp: new Date(),
          });

          // If emergency, notify all doctors
          if (message.isEmergency) {
            this.io?.to('role:doctor').emit('emergency:alert', {
              patientId: user.role === 'PATIENT' ? user.userId : message.receiverId,
              message: message.content,
              timestamp: new Date(),
            });
          }

          console.log(`📨 Message sent in room ${roomId}`);
        } catch (error) {
          console.error('❌ Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing:start', (data: { patientId: string; doctorId: string }) => {
        const user = socket.data.user as SocketUser;
        if (!user) return;

        const roomId = this.getChatRoomId(data.patientId, data.doctorId);
        socket.to(roomId).emit('typing:started', {
          userId: user.userId,
          email: user.email,
        });
      });

      socket.on('typing:stop', (data: { patientId: string; doctorId: string }) => {
        const user = socket.data.user as SocketUser;
        if (!user) return;

        const roomId = this.getChatRoomId(data.patientId, data.doctorId);
        socket.to(roomId).emit('typing:stopped', {
          userId: user.userId,
        });
      });

      // Handle message read receipts
      socket.on('message:read', (data: { messageId: string; patientId: string; doctorId: string }) => {
        const user = socket.data.user as SocketUser;
        if (!user) return;

        const roomId = this.getChatRoomId(data.patientId, data.doctorId);
        socket.to(roomId).emit('message:read:confirmed', {
          messageId: data.messageId,
          readBy: user.userId,
          readAt: new Date(),
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const user = socket.data.user as SocketUser;
        if (user) {
          this.userSockets.delete(user.userId);

          // Emit offline status
          this.io?.emit('user:offline', {
            userId: user.userId,
            role: user.role,
          });

          console.log(`🔌 User disconnected: ${user.email}`);
        } else {
          console.log('🔌 Socket disconnected:', socket.id);
        }
      });
    });

    console.log('✅ Socket.io server initialized');
  }

  // Helper method to create consistent chat room IDs
  private getChatRoomId(patientId: string, doctorId: string): string {
    return `chat:${patientId}:${doctorId}`;
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Send emergency alert to all online doctors
  sendEmergencyAlert(patientId: string, message: string) {
    if (this.io) {
      this.io.to('role:doctor').emit('emergency:alert', {
        patientId,
        message,
        timestamp: new Date(),
      });
    }
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

// Singleton instance
export const socketService = new SocketService();
