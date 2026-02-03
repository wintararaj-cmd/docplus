import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Monthly Revenue (Last 6 months)
        const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

        const completedAppointments = await prisma.appointment.findMany({
            where: {
                status: 'COMPLETED',
                appointmentDate: {
                    gte: sixMonthsAgo
                }
            },
            include: {
                doctor: {
                    select: { consultationFee: true }
                }
            }
        });

        const revenueMap: Record<string, number> = {};
        // Initialize months map
        for (let i = 0; i < 6; i++) {
            const date = subMonths(new Date(), i);
            const key = format(date, 'MMM yyyy');
            revenueMap[key] = 0;
        }

        completedAppointments.forEach(app => {
            const key = format(app.appointmentDate, 'MMM yyyy');
            if (revenueMap[key] !== undefined) {
                revenueMap[key] += app.doctor.consultationFee;
            }
        });

        const revenueData = Object.entries(revenueMap)
            .map(([name, value]) => ({ name, value }))
            .reverse(); // So oldest month is first

        // 2. Appointment Status Distribution
        const appointmentStats = await prisma.appointment.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        const statusData = appointmentStats.map(stat => ({
            name: stat.status,
            value: stat._count.status
        }));

        // 3. Top Doctors by Revenue
        // Fetch doctors and their completed appointment count
        const doctors = await prisma.doctor.findMany({
            include: {
                _count: {
                    select: {
                        appointments: {
                            where: { status: 'COMPLETED' }
                        }
                    }
                }
            }
        });

        const doctorStats = doctors.map(doc => ({
            name: `Dr. ${doc.firstName} ${doc.lastName}`,
            revenue: doc._count.appointments * doc.consultationFee,
            appointments: doc._count.appointments,
            specialization: doc.specialization
        }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return NextResponse.json({
            revenueData,
            statusData,
            doctorStats
        });

    } catch (error) {
        console.error('Error in detailed analytics:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
