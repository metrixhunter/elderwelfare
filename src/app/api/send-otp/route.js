import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = 'AC14a4aa7099f887c777709b57b88c250e';
const authToken = '04fd6679e696318b09d9b9265c4ae2d5';
const verifyServiceSid = 'VA357c4e5a24bf3007dd034f0a1b4435fc';

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

