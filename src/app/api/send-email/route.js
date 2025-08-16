import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { to, subject, text } = await req.json();

    // Configure your transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or smtp provider
      auth: {
        user: process.env.EMAIL_USER,   // set in .env.local
        pass: process.env.EMAIL_PASS,   // app password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Email sending error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
