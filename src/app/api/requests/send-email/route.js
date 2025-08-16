// File: src/app/api/requests/send-email/route.js
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 Incoming send-email body:", body);

    const {
      elderEmail,
      elderName,
      fromUsername,
      fromAge,
      toAge,
      requestHelp
    } = body;

    // ✅ Minimal required: an email + a sender name
    if (!elderEmail?.trim() || !fromUsername?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Missing elderEmail or fromUsername",
          received: body
        }),
        { status: 400 }
      );
    }

    const senderIsElder = fromAge && toAge && fromAge >= 60 && toAge < 60;

    // ✅ Inserted code for dynamic links
    const baseUrl = "https://helpforcharity.netlify.app";
    const acceptPath = senderIsElder ? "/accept-elder" : "/accept-youth";
    const declinePath = senderIsElder ? "/decline-elder" : "/decline-youth";
    const acceptLink = `${baseUrl}${acceptPath}?from=${encodeURIComponent(fromUsername)}`;
    const declineLink = `${baseUrl}${declinePath}?from=${encodeURIComponent(fromUsername)}`;

    let messageBody = "";
    if (senderIsElder) {
      messageBody = `
Elder ${fromUsername} is requesting help.

Medicines: ${requestHelp?.medicines ? "Yes" : "No"}
Medical Help: ${requestHelp?.medicalHelp ? "Yes" : "No"}
Money: ${requestHelp?.money > 0 ? `₹${requestHelp.money}` : "No"}

Message:
${requestHelp?.message || "(No message)"}

Accept: ${acceptLink}
Decline: ${declineLink}
      `;
    } else {
      messageBody = `
Hello ${elderName || "Elder"},

You have received a help offer from ${fromUsername}.

Medicines: ${requestHelp?.medicines ? "Yes" : "No"}
Medical Help: ${requestHelp?.medicalHelp ? "Yes" : "No"}
Money: ${requestHelp?.money > 0 ? `₹${requestHelp.money}` : "No"}

Message:
${requestHelp?.message || "(No message)"}

Accept: ${acceptLink}
Decline: ${declineLink}
      `;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ElderCare Welfare" <${process.env.EMAIL_USER}>`,
      to: elderEmail,
      subject: senderIsElder
        ? `Help Request from Elder ${fromUsername}`
        : `Help Offer from ${fromUsername}`,
      text: messageBody,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Email sent" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Email send error:", error);
    return new Response(
      JSON.stringify({ error: "Email failed", details: error.message }),
      { status: 500 }
    );
  }
}
