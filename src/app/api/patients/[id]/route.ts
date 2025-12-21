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

        // Ensure user is authenticated
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const patient = await prisma.patient.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        email: true,
                        phone: true
                    }
                }
            }
        })

        if (!patient) {
            return NextResponse.json(
                { success: false, error: 'Patient not found' },
                { status: 404 }
            )
        }

        // Calculate age
        let age = "N/A";
        if (patient.dateOfBirth) {
            const today = new Date();
            const dob = new Date(patient.dateOfBirth);
            let ageNum = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                ageNum--;
            }
            age = ageNum.toString();
        }

        return NextResponse.json({
            ...patient,
            age
        })
    } catch (error) {
        console.error('Error fetching patient:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch patient' },
            { status: 500 }
        )
    }
}
