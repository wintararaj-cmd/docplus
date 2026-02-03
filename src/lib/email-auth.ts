import crypto from 'crypto';
import { sendEmail } from './email';

export const generateVerificationToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563EB;">Confirm your email</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${confirmationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                Verify Email
            </a>
            <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Verify your email address',
        html,
    });
};
