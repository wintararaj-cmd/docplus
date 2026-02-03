import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: any = {};
        if (role && role !== 'ALL') {
            where.role = role;
        }

        const total = await prisma.user.count({ where });

        const users = await prisma.user.findMany({
            where,
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                email: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
                emailVerified: true,
            }
        });

        // Populate names manually
        const enrichedUsers = await Promise.all(users.map(async (user) => {
            let name = 'N/A';
            if (user.role === 'PATIENT') {
                const p = await prisma.patient.findUnique({ where: { userId: user.id } });
                name = p ? `${p.firstName} ${p.lastName}` : 'Profile Incomplete';
            } else if (user.role === 'DOCTOR') {
                const d = await prisma.doctor.findUnique({ where: { userId: user.id } });
                name = d ? `Dr. ${d.firstName} ${d.lastName}` : 'Profile Incomplete';
            } else {
                name = 'Admin User';
            }
            return { ...user, name };
        }));

        return NextResponse.json({
            users: enrichedUsers,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
