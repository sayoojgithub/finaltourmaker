// utils/sendPaymentOtpEmail.js
import nodemailer from "nodemailer";

export const sendPaymentOtpEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Tourmaker Payments" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🔐 Your Tourmaker Payment OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; border: 1px solid #e0e0e0; padding: 18px; border-radius: 12px;">
        <h2 style="color: #1a73e8; margin: 0 0 8px;">Payment OTP</h2>
        <p style="margin: 0 0 12px; color: #334155;">Use this OTP to view your payment balance and history.</p>
        <div style="font-size: 26px; font-weight: 800; letter-spacing: 6px; padding: 12px 14px; border-radius: 10px; background: #F6F8FC; display: inline-block; color: #0f172a;">
          ${otp}
        </div>
        <p style="margin: 14px 0 0; color: #64748b; font-size: 12px;">
          OTP is valid for <b>5 minutes</b>. If you didn’t request this, please ignore.
        </p>
        <p style="margin: 14px 0 0; color: #1a73e8; font-weight: 700;">
          — Tourmaker Payments
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
