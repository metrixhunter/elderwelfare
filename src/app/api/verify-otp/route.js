import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = 'AC5eb2ad25eeaa3e17521b1dba0aea32da';
const authToken = '86f3bfdf31a92830eeb75b8478a37944';
const verifyServiceSid = 'VAb2384b077974352c53ed15e13381f49b';

const client = twilio(accountSid, authToken);

export async function POST(req) {
  try {
    const { phone, code } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Code is required' }, { status: 400 });
    }

    // Allow bypass for test code 123456
    if (code === '123456') {
      return NextResponse.json({ success: true, message: 'OTP verified successfully (test code)' });
    }

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
    }

    // Actual Twilio verification
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