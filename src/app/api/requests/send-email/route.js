// File: src/app/api/requests/send-email/route.js
import nodemailer from "nodemailer";

// In-memory log (resets when server restarts)
let emailLogs = [];

export async function POST(req) {
  const body = await req.json();
  const { elderEmail, elderName, fromUsername, fromAge, requestHelp, recipientType } = body;

  if (!elderEmail || !fromUsername || !requestHelp || !fromAge || !recipientType) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Helper to generate Accept/Deny buttons
    const actionButtons = `
      <p>
        <a href="https://yourdomain.com/accept?from=${encodeURIComponent(fromUsername)}" style="padding:10px 15px;background-color:green;color:white;text-decoration:none;border-radius:5px;">Accept</a>
        <a href="https://yourdomain.com/deny?from=${encodeURIComponent(fromUsername)}" style="padding:10px 15px;background-color:red;color:white;text-decoration:none;border-radius:5px;">Deny</a>
      </p>
    `;

    let subject, emailHtml;

    if (fromAge < 60 && recipientType === "elder") {
      // Youth sending to elder
      subject = `Help Request from ${fromUsername}`;
      emailHtml = `
        <p>Hello ${elderName || "Elder"},</p>
        <p>You have received a new help request from <strong>${fromUsername}</strong>.</p>
        <ul>
          <li>Medicines: ${requestHelp.medicines ? "Yes" : "No"}</li>
          <li>Medical Help: ${requestHelp.medicalHelp ? "Yes" : "No"} (${requestHelp.medicalHelpSent ? "Sent" : "Not Sent"})</li>
          <li>Money: ${requestHelp.money > 0 ? `₹${requestHelp.money}` : "No"} (${requestHelp.moneySent ? "Sent" : "Not Sent"})</li>
          <li>Contact Email: ${requestHelp.requestEmail ? "Yes" : "No"}</li>
          <li>Contact Phone: ${requestHelp.requestPhone ? "Yes" : "No"}</li>
          <li>Contact Address: ${requestHelp.requestAddress ? "Yes" : "No"}</li>
        </ul>
        <p>Message: ${requestHelp.message || "(No additional message)"}</p>
        ${actionButtons}
        <p>Regards,<br>ElderCare Welfare Team</p>
      `;
    } else if (fromAge >= 60 && recipientType === "youth") {
      // Elder sending to youth
      subject = `Request from Elder ${fromUsername}`;
      emailHtml = `
        <p>Hello,</p>
        <p>Elder <strong>${fromUsername}</strong> is requesting your assistance.</p>
        <ul>
          <li>Medicines: ${requestHelp.medicines ? "Yes" : "No"}</li>
          <li>Medical Help: ${requestHelp.medicalHelp ? "Yes" : "No"} (${requestHelp.medicalHelpSent ? "Sent" : "Not Sent"})</li>
          <li>Money: ${requestHelp.money > 0 ? `₹${requestHelp.money}` : "No"} (${requestHelp.moneySent ? "Sent" : "Not Sent"})</li>
        </ul>
        <p>Message: ${requestHelp.message || "(No additional message)"}</p>
        ${actionButtons}
        <p>Regards,<br>ElderCare Welfare Team</p>
      `;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid age/recipient type combination" }),
        { status: 400 }
      );
    }

    // Send email
    await transporter.sendMail({
      from: `"ElderCare Welfare" <${process.env.EMAIL_USER}>`,
      to: elderEmail,
      subject,
      html: emailHtml,
    });

    // Log in memory
    emailLogs.push({
      elderEmail,
      elderName,
      fromUsername,
      fromAge,
      requestHelp,
      recipientType,
      sentAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email", details: error.message }),
      { status: 500 }
    );
  }
}
