import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const specialization = searchParams.get('specialization')
        const city = searchParams.get('city')

        const where: any = {
            isAvailable: true,
            licenseVerified: true
        }

        if (specialization && specialization !== 'All Specializations') {
            where.specialization = specialization
        }

        if (city) {
            where.city = city
        }

        const doctors = await prisma.doctor.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: {
                rating: 'desc'
            }
        })

        return NextResponse.json({
            success: true,
            doctors
        })
    } catch (error) {
        console.error('Error fetching doctors:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch doctors' },
            { status: 500 }
        )
    }
}
