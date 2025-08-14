// File: src/app/api/requests/notifyEmail/route.js
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json(); // In App Router, we parse JSON from req
    const { elderEmail, elderName, requestDetails } = body;

    if (!elderEmail) {
      return new Response(
        JSON.stringify({ error: "Elder email is required" }),
        { status: 400 }
      );
    }

    // Transporter setup (replace with your SMTP or Gmail credentials)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailText = `
Hello ${elderName || "Elder"},

You have received a new help request:

- Medicines: ${requestDetails.medicines ? "Yes" : "No"}
- Medical Help: ${requestDetails.medicalHelp ? "Yes" : "No"}
- Money Donation: ${requestDetails.money ? `₹${requestDetails.money}` : "No"}
- Request Email: ${requestDetails.requestEmail ? "Yes" : "No"}
- Request Phone: ${requestDetails.requestPhone ? "Yes" : "No"}
- Request Address: ${requestDetails.requestAddress ? "Yes" : "No"}

Message: ${requestDetails.message || "(No message)"}

From: ${requestDetails.fromUsername}
Sent on: ${new Date().toLocaleString()}

Please respond to them as soon as possible.
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: elderEmail,
      subject: "New Help Request from Youth Volunteer",
      text: emailText,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Email sending failed:", error);
    return new Response(
      JSON.stringify({ error: "Email sending failed" }),
      { status: 500 }
    );
  }
}
