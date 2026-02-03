'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
    isEmergency?: boolean;
    fileUrl?: string;
    fileName?: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface TypingUser {
    userId: string;
    email: string;
}

export function useSocket() {
    const { data: session } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    const socketRef = useRef<Socket | null>(null);

    // Initialize socket connection
    useEffect(() => {
        if (!session?.user) return;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

        const newSocket = io(socketUrl, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Connection handlers
        newSocket.on('connect', () => {
            console.log('✅ Socket connected');
            setIsConnected(true);

            // Authenticate user
            newSocket.emit('authenticate', {
                userId: session.user.id,
                role: session.user.role,
                email: session.user.email,
            });
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('authenticated', (data: { success: boolean; userId?: string; error?: string }) => {
            if (data.success) {
                console.log('✅ Socket authenticated');
            } else {
                console.error('❌ Socket authentication failed:', data.error);
            }
        });

        // Online/offline status
        newSocket.on('user:online', (data: { userId: string; role: string }) => {
            setOnlineUsers((prev) => new Set(prev).add(data.userId));
        });

        newSocket.on('user:offline', (data: { userId: string; role: string }) => {
            setOnlineUsers((prev) => {
                const updated = new Set(prev);
                updated.delete(data.userId);
                return updated;
            });
        });

        // Message handlers
        newSocket.on('message:received', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Typing indicators
        newSocket.on('typing:started', (user: TypingUser) => {
            setTypingUsers((prev) => {
                if (prev.find((u) => u.userId === user.userId)) return prev;
                return [...prev, user];
            });
        });

        newSocket.on('typing:stopped', (data: { userId: string }) => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        });

        // Read receipts
        newSocket.on('message:read:confirmed', (data: { messageId: string; readBy: string; readAt: Date }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === data.messageId ? { ...msg, status: 'read' as const } : msg
                )
            );
        });

        // Error handling
        newSocket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error.message);
        });

        // Cleanup
        return () => {
            newSocket.disconnect();
            socketRef.current = null;
        };
    }, [session]);

    // Join chat room
    const joinChat = useCallback(
        (patientId: string, doctorId: string) => {
            if (socket) {
                socket.emit('join:chat', { patientId, doctorId });
            }
        },
        [socket]
    );

    // Leave chat room
    const leaveChat = useCallback(
        (patientId: string, doctorId: string) => {
            if (socket) {
                socket.emit('leave:chat', { patientId, doctorId });
            }
        },
        [socket]
    );

    // Send message
    const sendMessage = useCallback(
        (message: Omit<Message, 'timestamp' | 'status'>) => {
            if (socket && isConnected) {
                socket.emit('message:send', message);

                // Optimistically add message to local state
                setMessages((prev) => [
                    ...prev,
                    { ...message, timestamp: new Date(), status: 'sending' as const },
                ]);
            }
        },
        [socket, isConnected]
    );

    // Send typing indicator
    const sendTyping = useCallback(
        (patientId: string, doctorId: string, isTyping: boolean) => {
            if (socket && isConnected) {
                if (isTyping) {
                    socket.emit('typing:start', { patientId, doctorId });
                } else {
                    socket.emit('typing:stop', { patientId, doctorId });
                }
            }
        },
        [socket, isConnected]
    );

    // Mark message as read
    const markAsRead = useCallback(
        (messageId: string, patientId: string, doctorId: string) => {
            if (socket && isConnected) {
                socket.emit('message:read', { messageId, patientId, doctorId });
            }
        },
        [socket, isConnected]
    );

    // Subscribe to emergency alerts (for doctors)
    const onEmergencyAlert = useCallback(
        (callback: (alert: { patientId: string; message: string; timestamp: Date }) => void) => {
            if (socket) {
                socket.on('emergency:alert', callback);
                return () => {
                    socket.off('emergency:alert', callback);
                };
            }
        },
        [socket]
    );

    // Subscribe to notifications
    const onNotification = useCallback(
        (callback: (notification: any) => void) => {
            if (socket) {
                socket.on('notification', callback);
                return () => {
                    socket.off('notification', callback);
                };
            }
        },
        [socket]
    );

    // Check if user is online
    const isUserOnline = useCallback(
        (userId: string) => {
            return onlineUsers.has(userId);
        },
        [onlineUsers]
    );

    return {
        socket,
        isConnected,
        messages,
        typingUsers,
        onlineUsers,
        joinChat,
        leaveChat,
        sendMessage,
        sendTyping,
        markAsRead,
        onEmergencyAlert,
        onNotification,
        isUserOnline,
    };
}
