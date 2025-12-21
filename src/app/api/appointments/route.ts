import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const appointmentSchema = z.object({
  doctorId: z.string(),
  appointmentDate: z.string(),
  startTime: z.string(),
  reason: z.string().min(1),
  notes: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = appointmentSchema.parse(body)

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    })

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient profile not found' },
        { status: 404 }
      )
    }

    // Calculate end time (assuming 30-minute slots)
    const [hours, minutes] = validatedData.startTime.split(':').map(Number)
    const endHours = minutes >= 30 ? hours + 1 : hours
    const endMinutes = minutes >= 30 ? minutes - 30 : minutes + 30
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`

    // Check for conflicts
    const appointmentDate = new Date(validatedData.appointmentDate)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        appointmentDate: {
          gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
          lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
        },
        startTime: validatedData.startTime,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked' },
        { status: 400 }
      )
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: validatedData.doctorId,
        appointmentDate: validatedData.appointmentDate,
        startTime: validatedData.startTime,
        endTime,
        reason: validatedData.reason,
        notes: validatedData.notes,
        status: 'PENDING'
      },
      include: {
        doctor: {
          include: {
            user: true
          }
        }
      }
    })

    // TODO: Send notification to doctor

    return NextResponse.json({
      success: true,
      appointment
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data provided' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let appointments

    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
      })

      if (!patient) {
        return NextResponse.json({ success: true, appointments: [] })
      }

      appointments = await prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'desc'
        }
      })
    } else if (session.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user.id }
      })

      if (!doctor) {
        return NextResponse.json({ success: true, appointments: [] })
      }

      appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'desc'
        }
      })
    }

    return NextResponse.json({
      success: true,
      appointments
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
