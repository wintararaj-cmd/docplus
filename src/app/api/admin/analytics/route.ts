import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated and is an admin
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // specific date ranges
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Run queries in parallel for performance
        const [
            totalPatients,
            totalDoctors,
            totalAppointments,
            todaysAppointments,
            pendingDoctors,
            recentUsers,
            revenueStats
        ] = await Promise.all([
            // Total Patients
            prisma.patient.count(),

            // Total Doctors
            prisma.doctor.count(),

            // Total Appointments
            prisma.appointment.count(),

            // Today's Appointments
            prisma.appointment.count({
                where: {
                    appointmentDate: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                },
            }),

            // Pending Doctor Verifications
            prisma.doctor.count({
                where: {
                    licenseVerified: false,
                },
            }),

            // Recent Users (last 5)
            prisma.user.findMany({
                take: 5,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    patient: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    },
                    doctor: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                },
            }),

            // Calculate Revenue (Completed appointments * Consultation Fee)
            // This is an estimation query
            prisma.appointment.findMany({
                where: {
                    status: 'COMPLETED',
                    appointmentDate: {
                        gte: startOfMonth,
                    }
                },
                select: {
                    doctor: {
                        select: {
                            consultationFee: true,
                        }
                    }
                }
            })
        ]);

        // Calculate total revenue for this month
        const totalRevenue = revenueStats.reduce((acc, curr) => {
            return acc + (curr.doctor?.consultationFee || 0);
        }, 0);

        return NextResponse.json({
            stats: {
                totalPatients,
                totalDoctors,
                totalAppointments,
                todaysAppointments,
                pendingDoctors,
                monthlyRevenue: totalRevenue,
            },
            recentUsers: recentUsers.map(user => ({
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.role === 'PATIENT'
                    ? `${user.patient?.firstName} ${user.patient?.lastName}`
                    : user.role === 'DOCTOR'
                        ? `Dr. ${user.doctor?.firstName} ${user.doctor?.lastName}`
                        : 'Admin User',
                createdAt: user.createdAt,
            })),
        });

    } catch (error) {
        console.error('Error fetching admin analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
