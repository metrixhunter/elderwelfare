// File: src/app/api/requests/send-email/route.js
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  const body = await req.json();
  const { elderEmail, elderName, fromUsername, requestHelp } = body;

  if (!elderEmail || !fromUsername || !requestHelp) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Change to SMTP if needed
      auth: {
        user: process.env.EMAIL_USER, // set in .env.local
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"ElderCare Welfare" <${process.env.EMAIL_USER}>`,
      to: elderEmail,
      subject: `Help Request from ${fromUsername}`,
      text: `
Hello ${elderName || 'Elder'}, 

You have received a new help request from ${fromUsername}.

Requested:
- Medicines: ${requestHelp.medicines ? 'Yes' : 'No'}
- Medical Help: ${requestHelp.medicalHelp ? 'Yes' : 'No'}
- Money: ${requestHelp.money > 0 ? `₹${requestHelp.money}` : 'No'}
- Contact Info Requested:
   Email: ${requestHelp.requestEmail ? 'Yes' : 'No'}
   Phone: ${requestHelp.requestPhone ? 'Yes' : 'No'}
   Address: ${requestHelp.requestAddress ? 'Yes' : 'No'}

Message:
${requestHelp.message || '(No additional message)'}

Regards,
ElderCare Welfare Team
      `
    };

    await transporter.sendMail(mailOptions);

    // ✅ Log email details in emailLogs.json
    const logPath = path.join(process.cwd(), 'emailLogs.json');
    let logs = [];
    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf-8') || '[]');
    }
    logs.push({
      elderEmail,
      elderName,
      fromUsername,
      requestHelp,
      sentAt: new Date().toISOString()
    });
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true, message: 'Email sent and logged.' }), { status: 200 });
  } catch (error) {
    console.error('Email send error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email', details: error.message }), { status: 500 });
  }
}
