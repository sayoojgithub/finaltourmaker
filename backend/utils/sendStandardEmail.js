import nodemailer from "nodemailer";

export const sendStandardEmail = async (to, companyName, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Tourmaker Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🎉 Company Approved - Tourmaker Login Credentials",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
        <h2 style="color: #6D5DF5;">Hello ${companyName},</h2>
        <p>Your company has been <strong style="color: green;">approved</strong> by the Tourmaker team.</p>
        <p><strong>Login Credentials:</strong></p>
        <table style="border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Username:</td>
            <td style="padding: 8px;">${to}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Password:</td>
            <td style="padding: 8px;">${password}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Please change your password after your first login.</p>
        <br/>
        <p style="color: #6D5DF5;">Best regards,<br/>Tourmaker Admin Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};