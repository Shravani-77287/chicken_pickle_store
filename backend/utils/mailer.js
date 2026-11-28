// backend/utils/mailer.js
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

const sendOrderEmail = async ({ to, subject, html }) => {
  if (!to) return;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // Fallback to console log if SMTP credentials are not configured yet
  if (!nodemailer || !SMTP_USER || !SMTP_PASS) {
    console.log(`📧 [Email Simulation] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST || 'smtp.gmail.com',
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Chicken Pickle Store 🌶️" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Email send error (non-blocking):', error.message);
  }
};

module.exports = { sendOrderEmail };