import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/chat/messages - Get chat messages between patient and doctor
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const doctorId = searchParams.get('doctorId');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!patientId || !doctorId) {
            return NextResponse.json(
                { error: 'Patient ID and Doctor ID are required' },
                { status: 400 }
            );
        }

        // Verify user has access to this conversation
        const userRole = session.user.role;
        const userId = session.user.id;

        if (userRole === 'PATIENT' && userId !== patientId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (userRole === 'DOCTOR' && userId !== doctorId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch messages
        const messages = await prisma.message.findMany({
            where: {
                patientId,
                doctorId,
            },
            orderBy: {
                createdAt: 'asc',
            },
            take: limit,
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                doctor: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST /api/chat/messages - Send a new message
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { patientId, doctorId, content, isEmergency, fileUrl, fileName } = body;

        if (!patientId || !doctorId || !content) {
            return NextResponse.json(
                { error: 'Patient ID, Doctor ID, and content are required' },
                { status: 400 }
            );
        }

        const userRole = session.user.role;
        const userId = session.user.id;

        // Verify user is part of this conversation
        if (userRole === 'PATIENT' && userId !== patientId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (userRole === 'DOCTOR' && userId !== doctorId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                patientId,
                doctorId,
                senderId: userId,
                content,
                messageType: isEmergency ? 'EMERGENCY' : 'REGULAR',
                isEmergency: isEmergency || false,
                fileUrl,
                fileName,
                status: 'SENT',
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                doctor: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Create notification for recipient
        const recipientId = userId === patientId ? doctorId : patientId;
        await prisma.notification.create({
            data: {
                userId: recipientId,
                type: isEmergency ? 'EMERGENCY_CHAT' : 'NEW_MESSAGE',
                title: isEmergency ? 'Emergency Message' : 'New Message',
                message: `You have a new ${isEmergency ? 'emergency ' : ''}message`,
                metadata: {
                    messageId: message.id,
                    senderId: userId,
                    patientId,
                    doctorId,
                },
            },
        });

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}

// PATCH /api/chat/messages - Mark messages as read
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { messageIds } = body;

        if (!messageIds || !Array.isArray(messageIds)) {
            return NextResponse.json(
                { error: 'Message IDs array is required' },
                { status: 400 }
            );
        }

        // Update message status to READ
        await prisma.message.updateMany({
            where: {
                id: {
                    in: messageIds,
                },
                senderId: {
                    not: session.user.id, // Don't mark own messages as read
                },
            },
            data: {
                status: 'READ',
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
}
