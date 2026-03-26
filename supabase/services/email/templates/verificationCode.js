export function verificationCodeTemplate(code) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #667eea; margin-top: 0;">Email Verification</h2>
          <p>Hello,</p>
          <p>Your verification code for HRMS staff access is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px;">${code}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="font-size: 12px; color: #999;">If you did not request this code, please ignore this email.</p>
        </div>
      </body>
    </html>
  `;
}