import { prisma } from '@/lib/db';
import { sendEmail } from './email';
import { sendSMS } from './sms';
import { NotificationType } from '@prisma/client';

interface NotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
    channels?: ('EMAIL' | 'SMS' | 'IN_APP')[];
}

export const NotificationService = {
    async send({
        userId,
        type,
        title,
        message,
        metadata,
        channels = ['IN_APP', 'EMAIL'], // Default channels
    }: NotificationParams) {
        try {
            // 1. Create In-App Notification (Always)
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    message,
                    metadata: metadata || {},
                },
            });

            // Fetch user contact info if needed for external channels
            if (channels.includes('EMAIL') || channels.includes('SMS')) {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { email: true, phone: true },
                });

                if (!user) return notification;

                // 2. Send Email
                if (channels.includes('EMAIL') && user.email) {
                    await sendEmail({
                        to: user.email,
                        subject: title,
                        html: `<p>${message}</p>`, // Basic wrapper
                    });
                }

                // 3. Send SMS
                if (channels.includes('SMS') && user.phone) {
                    await sendSMS({
                        to: user.phone,
                        body: `${title}: ${message}`,
                    });
                }
            }

            return notification;
        } catch (error) {
            console.error('Error in NotificationService:', error);
            // Don't throw, just log. Notification failure shouldn't block main flow.
            return null;
        }
    },
};
