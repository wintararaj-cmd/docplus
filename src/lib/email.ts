import nodemailer from 'nodemailer';

const isProduction = process.env.NODE_ENV === 'production';

// Check if email config is properly set
const hasEmailConfig =
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD !== 'your-api-key';

let transporter: nodemailer.Transporter | null = null;

if (hasEmailConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  // If no config or explicit mock mode, log to console
  if (!transporter) {
    console.log('📧 [MOCK EMAIL SERVICE]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--- Content ---');
    console.log(text || html);
    console.log('----------------');
    return true; // Simulate success
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Simple strip HTML
    });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

// Pre-defined templates
export const emailTemplates = {
  appointmentConfirmation: (patientName: string, doctorName: string, date: string, time: string) => ({
    subject: 'Appointment Confirmed',
    html: `
      <h1>Appointment Confirmation</h1>
      <p>Dear ${patientName},</p>
      <p>Your appointment with Dr. ${doctorName} has been confirmed.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>Please arrive 10 minutes eary.</p>
    `,
  }),
  appointmentReminder: (patientName: string, doctorName: string, time: string) => ({
    subject: 'Appointment Reminder',
    html: `
      <h1>Upcoming Appointment Reminder</h1>
      <p>Hello ${patientName},</p>
      <p>This is a reminder for your appointment tomorrow with Dr. ${doctorName}.</p>
      <p><strong>Time:</strong> ${time}</p>
    `,
  }),
  doctorVerification: (doctorName: string) => ({
    subject: 'Profile Verified',
    html: `
      <h1>Profile Verified</h1>
      <p>Dr. ${doctorName},</p>
      <p>Your profile has been verified by the administration. You are now visible to patients.</p>
    `,
  }),
};
