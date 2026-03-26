// BACKEND USAGE EXAMPLE
// This file demonstrates how to use the email service from Supabase Edge Functions
// Location: supabase/functions/send-staff-verification/index.ts (example)

// Example 1: Using sendEmail service directly in an edge function
// import { sendEmail } from '../../services/email/sendEmail.js';

// Example 2: Using verified email with templates
// import { interviewTemplate } from '../../services/email/templates/interview.js';
// import { jobOfferTemplate } from '../../services/email/templates/jobOffer.js';

// ============================================
// Supabase Edge Function Example
// ============================================

// Example: Send interview notification from edge function
export async function sendInterviewNotification(applicant) {
  // This example assumes sendEmail is imported from the service
  // For Supabase Edge Functions, you would need to inline the fetch logic
  // or create a shared utility
  
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #667eea; margin-top: 0;">Interview Scheduled</h2>
          <p>Hello ${applicant.name},</p>
          <p>Your interview is scheduled on <strong>${applicant.date}</strong>.</p>
          <p>Please be on time and prepare accordingly.</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">If you have any questions, please contact our HR team.</p>
        </div>
      </body>
    </html>
  `;

  // Call the resend-send-email edge function
  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/resend-send-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        to: applicant.email,
        subject: 'Interview Scheduled',
        html,
        from: 'HR Team <jobs@hrmsystem.com>',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to send interview email: ${response.statusText}`);
  }

  return await response.json();
}

// ============================================
// Rules to Follow (CRITICAL)
// ============================================

/*
1. ✅ BACKEND ONLY - Never import sendEmail in React/Frontend code
2. ✅ API Key Security - RESEND_API_KEY should ONLY be in environment variables
3. ✅ No Hardcoded Keys - Never commit API keys to repository
4. ✅ Use Edge Functions - For Supabase, call functions from other functions
5. ✅ Error Handling - Always handle and log Resend API errors
6. ✅ Email Headers - Include proper 'from' email for brand consistency
7. ✅ HTML Templates - Keep templates modular and reusable
8. ✅ Testing - Test locally with dummy emails before deploying

*/

// ============================================
// Environment Setup Checklist
// ============================================

/*
BEFORE using this, ensure:

1. Set RESEND_API_KEY in Supabase:
   - Go to Supabase Project Settings → Edge Functions → Secrets
   - Add RESEND_API_KEY = your_resend_api_key_here

2. Verify Resend API Key:
   - Get from https://resend.com/api-keys
   - Format: re_xxxxxxxxxxxxx

3. Deploy Functions:
   - supabase functions deploy resend-send-email

4. Test Endpoint:
   - Use curl or Postman to test:
   
   curl -X POST http://localhost:54321/functions/v1/resend-send-email \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     -d '{
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<h1>Test</h1>",
       "from": "test@yourdomain.com"
     }'

5. Check Logs:
   - supabase functions logs resend-send-email

*/
