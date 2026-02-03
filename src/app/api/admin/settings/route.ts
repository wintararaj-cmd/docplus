import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get settings or create default
        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    siteName: 'Patient Management System',
                    supportEmail: 'support@example.com',
                }
            });
        }

        return NextResponse.json({ settings });

    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { siteName, supportEmail, supportPhone, enableRegistration, enableChat, maintenanceMode } = body;

        // Upsert settings (update if exists, create if not)
        // Since we only want one row, we can just findFirst -> update or create
        const existing = await prisma.systemSettings.findFirst();

        let settings;
        if (existing) {
            settings = await prisma.systemSettings.update({
                where: { id: existing.id },
                data: {
                    siteName,
                    supportEmail,
                    supportPhone,
                    enableRegistration,
                    enableChat,
                    maintenanceMode
                }
            });
        } else {
            settings = await prisma.systemSettings.create({
                data: {
                    siteName,
                    supportEmail,
                    supportPhone,
                    enableRegistration,
                    enableChat,
                    maintenanceMode
                }
            });
        }

        return NextResponse.json({ settings });

    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
