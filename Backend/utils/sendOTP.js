const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send a styled OTP email
 * @param {string} to – recipient email
 * @param {string} otp – 6-digit OTP code
 */
async function sendOTP(to, otp) {
    const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background:#0a0514;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:480px;margin:40px auto;background:linear-gradient(135deg,#0f0a1e,#1a1030);border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">

      <!-- Header -->
      <div style="text-align:center;padding:32px 24px 20px;">
        <div style="font-size:24px;font-weight:bold;margin-bottom:8px;">Noodle</div>
        <div style="font-size:22px;font-weight:800;letter-spacing:0.08em;color:#fff;">NOODLE</div>
        <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-top:4px;">
          AI Fitness Platform
        </div>
      </div>

      <!-- Divider -->
      <div style="width:60px;height:2px;margin:0 auto 24px;background:linear-gradient(90deg,transparent,rgba(200,180,255,0.4),transparent);border-radius:99px;"></div>

      <!-- Body -->
      <div style="padding:0 32px 32px;text-align:center;">
        <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;line-height:1.6;">
          Your verification code is:
        </p>

        <!-- OTP Code -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
          <div style="font-size:36px;font-weight:800;letter-spacing:0.5em;color:#fff;font-family:'Courier New',monospace;">
            ${otp}
          </div>
        </div>

        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0 0 6px;">
          This code expires in <strong style="color:rgba(255,255,255,0.5);">5 minutes</strong>.
        </p>
        <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
        <p style="color:rgba(255,255,255,0.12);font-size:10px;margin:0;">
          © ${new Date().getFullYear()} Noodle — AI Fitness Platform
        </p>
      </div>
    </div>
  </body>
  </html>`;

    await transporter.sendMail({
        from: `"Noodle" <${process.env.EMAIL_USER}>`,
        to,
        subject: `${otp} — Your Noodle verification code`,
        html,
    });
}

module.exports = sendOTP;
