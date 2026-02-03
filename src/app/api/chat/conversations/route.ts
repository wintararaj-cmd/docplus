import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/chat/conversations - Get list of conversations for current user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;
        const userId = session.user.id;

        let conversations;

        if (userRole === 'PATIENT') {
            // Get all doctors the patient has chatted with
            conversations = await prisma.message.findMany({
                where: {
                    patientId: userId,
                },
                distinct: ['doctorId'],
                select: {
                    doctorId: true,
                    doctor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            specialization: true,
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // Get last message and unread count for each conversation
            const conversationsWithDetails = await Promise.all(
                conversations.map(async (conv) => {
                    const lastMessage = await prisma.message.findFirst({
                        where: {
                            patientId: userId,
                            doctorId: conv.doctorId,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    });

                    const unreadCount = await prisma.message.count({
                        where: {
                            patientId: userId,
                            doctorId: conv.doctorId,
                            senderId: conv.doctorId,
                            status: {
                                not: 'READ',
                            },
                        },
                    });

                    return {
                        id: conv.doctorId,
                        type: 'doctor' as const,
                        doctor: conv.doctor,
                        lastMessage,
                        unreadCount,
                    };
                })
            );

            return NextResponse.json({ conversations: conversationsWithDetails });
        } else if (userRole === 'DOCTOR') {
            // Get all patients the doctor has chatted with
            conversations = await prisma.message.findMany({
                where: {
                    doctorId: userId,
                },
                distinct: ['patientId'],
                select: {
                    patientId: true,
                    patient: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            dateOfBirth: true,
                            bloodGroup: true,
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // Get last message and unread count for each conversation
            const conversationsWithDetails = await Promise.all(
                conversations.map(async (conv) => {
                    const lastMessage = await prisma.message.findFirst({
                        where: {
                            patientId: conv.patientId,
                            doctorId: userId,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    });

                    const unreadCount = await prisma.message.count({
                        where: {
                            patientId: conv.patientId,
                            doctorId: userId,
                            senderId: conv.patientId,
                            status: {
                                not: 'READ',
                            },
                        },
                    });

                    const hasEmergency = await prisma.message.findFirst({
                        where: {
                            patientId: conv.patientId,
                            doctorId: userId,
                            isEmergency: true,
                            resolvedAt: null,
                        },
                    });

                    return {
                        id: conv.patientId,
                        type: 'patient' as const,
                        patient: conv.patient,
                        lastMessage,
                        unreadCount,
                        hasEmergency: !!hasEmergency,
                    };
                })
            );

            // Sort by emergency first, then by last message time
            conversationsWithDetails.sort((a, b) => {
                if (a.hasEmergency && !b.hasEmergency) return -1;
                if (!a.hasEmergency && b.hasEmergency) return 1;

                const aTime = a.lastMessage?.createdAt?.getTime() || 0;
                const bTime = b.lastMessage?.createdAt?.getTime() || 0;
                return bTime - aTime;
            });

            return NextResponse.json({ conversations: conversationsWithDetails });
        } else {
            return NextResponse.json({ conversations: [] });
        }
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}
