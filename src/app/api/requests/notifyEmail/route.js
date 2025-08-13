// /pages/api/requests/notifyEmail.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { elderEmail, elderName, requestDetails } = req.body;

    if (!elderEmail) {
      return res.status(400).json({ error: "Elder email is required" });
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

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    return res.status(500).json({ error: "Email sending failed" });
  }
}
