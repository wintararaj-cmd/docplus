import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        email: true,
                        phone: true
                    }
                },
                availability: {
                    where: { isActive: true },
                    orderBy: { dayOfWeek: 'asc' }
                }
            }
        })

        if (!doctor) {
            return NextResponse.json(
                { success: false, error: 'Doctor not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            doctor
        })
    } catch (error) {
        console.error('Error fetching doctor:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch doctor details' },
            { status: 500 }
        )
    }
}
