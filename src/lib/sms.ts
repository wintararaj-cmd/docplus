import twilio from 'twilio';

const hasSmsConfig =
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID !== 'your-account-sid';

let client: twilio.Twilio | null = null;

if (hasSmsConfig) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

interface SendSMSParams {
    to: string;
    body: string;
}

export async function sendSMS({ to, body }: SendSMSParams): Promise<boolean> {
    if (!client) {
        console.log('📱 [MOCK SMS SERVICE]');
        console.log(`To: ${to}`);
        console.log(`Body: ${body}`);
        console.log('----------------');
        return true;
    }

    try {
        await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log(`✅ SMS sent to ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending SMS:', error);
        return false;
    }
}
