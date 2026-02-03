import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationService } from '@/lib/notifications';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, recipientId, message } = body;

        // Mock sending based on type
        if (type === 'EMAIL') {
            // In real app, you'd call EmailService.send(...)
            console.log(`[TEST EMAIL] To: ${recipientId}, Message: ${message}`);
        } else if (type === 'SMS') {
            // SMSService.send(...)
            console.log(`[TEST SMS] To: ${recipientId}, Message: ${message}`);
        } else {
            // In-App
            await NotificationService.send({
                userId: recipientId || session.user.id,
                type: 'NEW_MESSAGE',
                title: 'Test Notification',
                message: message || 'This is a test notification from Admin.',
            });
        }

        return NextResponse.json({ success: true, message: `Test ${type} sent successfully (mocked)` });

    } catch (error) {
        console.error('Error sending test notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
