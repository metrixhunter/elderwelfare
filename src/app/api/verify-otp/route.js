import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = 'AC14a4aa7099f887c777709b57b88c250e';
const authToken = '04fd6679e696318b09d9b9265c4ae2d5';
const verifyServiceSid = 'VA357c4e5a24bf3007dd034f0a1b4435fc';

const client = twilio(accountSid, authToken);

export async function POST(req) {
  try {
    const { phone, code } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Code is required' }, { status: 400 });
    }

    // ✅ Allow bypass if 123456 and phone is missing
    if (code === '123456' && (!phone || phone === '')) {
      return NextResponse.json({ success: true, message: 'OTP verified successfully (fallback without phone)' });
    }

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
    }

    // ✅ Allow bypass even if phone is present but test code is entered
    if (code === '123456') {
      return NextResponse.json({ success: true, message: 'OTP verified successfully (test code)' });
    }

    // 🔐 Real verification with Twilio
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({ to: phone, code });

    if (verificationCheck.status === 'approved') {
      return NextResponse.json({ success: true, message: 'OTP verified successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

