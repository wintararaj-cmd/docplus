import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NotificationService } from '@/lib/notifications';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'DOCTOR') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const patientId = formData.get('patientId') as string;
        const testName = formData.get('testName') as string;
        const testDate = formData.get('testDate') as string;
        const results = formData.get('results') as string; // JSON string
        const file = formData.get('file') as File | null;

        if (!patientId || !testName || !testDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: { user: true } // Need user for notification
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        let fileUrl: string | undefined;
        let fileName: string | undefined;

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const timestamp = Date.now();
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            fileName = `${timestamp}-${originalName}`;

            const uploadDir = join(process.cwd(), 'public', 'uploads', 'lab-reports');
            const filePath = join(uploadDir, fileName);

            // Ensure directory exists
            const fs = require('fs');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            await writeFile(filePath, buffer);
            fileUrl = `/uploads/lab-reports/${fileName}`;
        }

        // Create Lab Report
        const labReport = await prisma.labReport.create({
            data: {
                patientId,
                testName,
                testDate: new Date(testDate),
                results: results ? JSON.parse(results) : {},
                fileUrl,
                fileName,
                remarks: 'Uploaded by Doctor',
            },
        });

        // Notify Patient
        await NotificationService.send({
            userId: patient.userId,
            type: 'LAB_REPORT_READY',
            title: 'New Lab Report Available',
            message: `Your lab results for ${testName} are now ready to view.`,
            channels: ['EMAIL', 'IN_APP', 'SMS'],
            metadata: {
                labReportId: labReport.id,
                testName
            }
        });

        return NextResponse.json({ success: true, labReport });

    } catch (error) {
        console.error('Error creating lab report:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create lab report' },
            { status: 500 }
        );
    }
}
