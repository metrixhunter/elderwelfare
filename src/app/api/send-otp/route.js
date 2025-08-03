import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = 'AC5eb2ad25eeaa3e17521b1dba0aea32da';
const authToken = '86f3bfdf31a92830eeb75b8478a37944';
const verifyServiceSid = 'VAb2384b077974352c53ed15e13381f49b';

const client = twilio(accountSid, authToken);

export async function POST(req) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
    }

    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: phone, channel: 'sms' });

    if (verification.status === 'pending') {
      return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

