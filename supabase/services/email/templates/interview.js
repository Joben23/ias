export function interviewTemplate(name, date) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #667eea; margin-top: 0;">Interview Scheduled</h2>
          <p>Hello ${name},</p>
          <p>Your interview is scheduled on <strong>${date}</strong>.</p>
          <p>Please be on time and prepare accordingly.</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">If you have any questions, please contact our HR team.</p>
        </div>
      </body>
    </html>
  `;
}