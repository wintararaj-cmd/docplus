import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { doctorId, action } = await request.json();

        if (!doctorId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (action === 'approve') {
            // Approve doctor
            const updateDoctor = await prisma.doctor.update({
                where: { id: doctorId },
                data: {
                    licenseVerified: true,
                    isAvailable: true,
                },
            });

            // Also mark the user as active/verified if needed
            await prisma.user.update({
                where: { id: updateDoctor.userId },
                data: {
                    isActive: true,
                    emailVerified: new Date(), // Auto-verify email upon admin approval
                },
            });

            // Send email notification here (ToDo)

            return NextResponse.json({ success: true, message: 'Doctor approved successfully' });
        } else if (action === 'reject') {
            // For now, let's just don't verify. Or we could deactivate the user.
            // Ideally we would send a rejection email with reason.

            const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
            if (doctor) {
                await prisma.user.update({
                    where: { id: doctor.userId },
                    data: { isActive: false },
                });
            }

            return NextResponse.json({ success: true, message: 'Doctor rejected and account deactivated' });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error verifying doctor:', error);
        return NextResponse.json(
            { error: 'Failed to process verification' },
            { status: 500 }
        );
    }
}
