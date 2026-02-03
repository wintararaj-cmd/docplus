import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { NotificationService } from '@/lib/notifications';
import { emailTemplates } from '@/lib/email';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
    // Security check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'local_cron_secret'}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        const tomorrowStart = new Date(now);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setHours(23, 59, 59, 999);

        // Find upcoming appointments for tomorrow that haven't been reminded
        const appointments = await prisma.appointment.findMany({
            where: {
                appointmentDate: {
                    gte: tomorrowStart,
                    lte: tomorrowEnd,
                },
                status: 'CONFIRMED',
                reminderSent: false,
            },
            include: {
                patient: {
                    include: { user: true }
                },
                doctor: {
                    include: { user: true }
                }
            },
        });

        console.log(`Found ${appointments.length} appointments for reminders.`);

        const results = await Promise.all(appointments.map(async (apt) => {
            try {
                const timeString = apt.startTime; // e.g. "10:00"

                // Send Email
                const emailContent = emailTemplates.appointmentReminder(
                    `${apt.patient.firstName} ${apt.patient.lastName}`,
                    `${apt.doctor.firstName} ${apt.doctor.lastName}`,
                    timeString
                );

                if (apt.patient.user.email) {
                    await NotificationService.send({
                        userId: apt.patient.userId,
                        type: 'APPOINTMENT_REMINDER',
                        title: emailContent.subject,
                        message: `Reminder: Appointment with Dr. ${apt.doctor.lastName} tomorrow at ${timeString}`,
                        channels: ['EMAIL', 'IN_APP', 'SMS'],
                    });
                }

                // Mark as reminded
                await prisma.appointment.update({
                    where: { id: apt.id },
                    data: { reminderSent: true }
                });

                return { id: apt.id, status: 'sent' };
            } catch (err) {
                console.error(`Failed to process reminder for apt ${apt.id}`, err);
                return { id: apt.id, status: 'failed' };
            }
        }));

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        });

    } catch (error) {
        console.error('Error running reminders cron:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
