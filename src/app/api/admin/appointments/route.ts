import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const date = searchParams.get('date');

        const where: Prisma.AppointmentWhereInput = {};

        if (status && status !== 'ALL') {
            where.status = status as any;
        }

        if (date) {
            const queryDate = new Date(date);
            const nextDay = new Date(queryDate);
            nextDay.setDate(nextDay.getDate() + 1);

            where.appointmentDate = {
                gte: queryDate,
                lt: nextDay,
            };
        }

        if (search) {
            where.OR = [
                {
                    patient: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                        ]
                    }
                },
                {
                    doctor: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                        ]
                    }
                }
            ];
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        user: { select: { email: true } }
                    }
                },
                doctor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    }
                }
            },
            orderBy: {
                appointmentDate: 'desc'
            }
        });

        return NextResponse.json({ appointments });

    } catch (error) {
        console.error('Error fetching admin appointments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
