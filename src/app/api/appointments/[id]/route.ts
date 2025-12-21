import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: params.id },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                doctor: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                prescriptions: true // Include prescriptions if needed
            }
        })

        if (!appointment) {
            return NextResponse.json(
                { success: false, error: 'Appointment not found' },
                { status: 404 }
            )
        }

        // Calculate age for patient
        let patientWithAge = { ...appointment.patient, age: "N/A" };
        if (appointment.patient.dateOfBirth) {
            const today = new Date();
            const dob = new Date(appointment.patient.dateOfBirth);
            let ageNum = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                ageNum--;
            }
            patientWithAge.age = ageNum.toString();
        }

        return NextResponse.json({
            ...appointment,
            patient: patientWithAge
        })
    } catch (error) {
        console.error('Error fetching appointment:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch appointment' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { status, cancelReason } = body

        // Update appointment and fetch patient info for notification
        const appointment = await prisma.appointment.update({
            where: { id: params.id },
            data: {
                status,
                ...(cancelReason && { cancelReason })
            },
            include: {
                patient: true,
                doctor: true
            }
        })

        // Create notification for patient
        if (status === 'CONFIRMED' || status === 'CANCELLED') {
            const notificationType = status === 'CONFIRMED'
                ? 'APPOINTMENT_CONFIRMED'
                : 'APPOINTMENT_CANCELLED';

            const title = status === 'CONFIRMED'
                ? 'Appointment Confirmed'
                : 'Appointment Cancelled';

            const message = status === 'CONFIRMED'
                ? `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has been confirmed for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.startTime}.`
                : `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} has been cancelled. ${cancelReason ? `Reason: ${cancelReason}` : ''}`;

            await prisma.notification.create({
                data: {
                    userId: appointment.patient.userId,
                    type: notificationType,
                    title,
                    message,
                    metadata: { appointmentId: appointment.id }
                }
            });
        }

        return NextResponse.json({
            success: true,
            appointment
        })
    } catch (error) {
        console.error('Error updating appointment:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update appointment' },
            { status: 500 }
        )
    }
}
