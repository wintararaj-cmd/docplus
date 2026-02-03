import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'DOCTOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        email: true,
                        phone: true
                    }
                }
            }
        });

        if (!doctor) {
            return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
        }

        return NextResponse.json({ doctor });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'DOCTOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            about,
            address,
            city,
            state,
            zipCode,
            consultationFee,
            experience,
            qualification
        } = body;

        // Update doctor profile
        const doctor = await prisma.doctor.update({
            where: { userId: session.user.id },
            data: {
                about,
                address,
                city,
                state,
                zipCode,
                consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
                experience: experience ? parseInt(experience) : undefined,
                qualification
            }
        });

        return NextResponse.json({ doctor });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
