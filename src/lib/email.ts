import crypto from 'crypto';

export function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function generateVerificationLink(token: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return `${baseUrl}/verify-email?token=${token}`;
}

export async function sendVerificationEmail(email: string, token: string) {
    const verificationLink = generateVerificationLink(token);

    // For development, just log the link
    if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 Email Verification Link:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`To: ${email}`);
        console.log(`Link: ${verificationLink}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return { success: true };
    }

    // In production, use a real email service
    // Example with nodemailer (you'll need to configure SMTP settings)
    try {
        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@healthcare.com',
            to: email,
            subject: 'Verify your email - HealthCare+',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to HealthCare+</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for registering with HealthCare+. Please click the button below to verify your email address and activate your account.</p>
                <p style="text-align: center;">
                  <a href="${verificationLink}" class="button">Verify Email Address</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account with HealthCare+, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} HealthCare+. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

export async function sendDoctorVerificationNotification(email: string, approved: boolean) {
    // For development, just log
    if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 Doctor Verification Notification:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`To: ${email}`);
        console.log(`Status: ${approved ? 'APPROVED' : 'REJECTED'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return { success: true };
    }

    // Production email sending logic here
    try {
        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const subject = approved
            ? 'Your Doctor Account Has Been Verified!'
            : 'Doctor Application Update';

        const message = approved
            ? 'Congratulations! Your doctor account has been verified and activated. You can now login and start managing your practice.'
            : 'Thank you for your interest in HealthCare+. Unfortunately, we were unable to verify your credentials at this time. Please contact support for more information.';

        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@healthcare.com',
            to: email,
            subject,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${approved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: ${approved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${subject}</h1>
              </div>
              <div class="content">
                <p>${message}</p>
                ${approved ? `
                  <p style="text-align: center;">
                    <a href="${process.env.NEXTAUTH_URL}/login" class="button">Login to Your Account</a>
                  </p>
                ` : ''}
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} HealthCare+. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error };
    }
}
