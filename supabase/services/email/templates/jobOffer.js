export function jobOfferTemplate(name) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #667eea; margin-top: 0;">Congratulations ${name}!</h2>
          <p>We are delighted to offer you the position with our organization.</p>
          <p>You have been selected based on your qualifications, experience, and interview performance.</p>
          <p>Please review the attached offer letter and contact our HR team to proceed with the next steps.</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">Welcome to our team!</p>
        </div>
      </body>
    </html>
  `;
}