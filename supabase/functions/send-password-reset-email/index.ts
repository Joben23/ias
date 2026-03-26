import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Professional HTML email template for password reset
function generatePasswordResetEmailHTML(employeeName: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .message-box { background-color: #f9f9f9; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .security-note { background-color: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #856404; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
    .link-text { font-size: 12px; color: #666; margin-top: 15px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Secure Access Recovery</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear <strong>${employeeName}</strong>,</p>
      
      <p>We received a request to reset your password for your hospital HR system account. If you did not request this, please ignore this email and your password will remain unchanged.</p>
      
      <div class="message-box">
        <p style="margin: 0;">To reset your password, click the button below:</p>
      </div>
      
      <a href="${resetLink}" class="cta-button">Reset Your Password</a>
      
      <div class="security-note">
        <strong>Security Notice:</strong> This password reset link will expire in 24 hours. If you did not request this action, please update your password immediately or contact IT support.
      </div>
      
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <div class="link-text">${resetLink}</div>
      
      <p style="margin-top: 30px;">This is an automated message from your hospital HR system. Do not reply to this email. For support, contact: hr@hospital.local</p>
    </div>
    
    <div class="footer">
      <p>Hospital HR Management System | Password Reset</p>
      <p>This email contains sensitive information. Please do not forward without appropriate security measures.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Log password reset email
async function logPasswordResetEmail(supabaseAdmin: any, employeeId: string, recipientEmail: string, status: string, resendId?: string, errorMessage?: string) {
  try {
    await supabaseAdmin.from('email_logs').insert({
      interview_id: null, // No interview for password reset
      applicant_id: null,
      recipient_email: recipientEmail,
      subject: 'Password Reset Request',
      template_type: 'password_reset',
      status,
      resend_id: resendId || null,
      error_message: errorMessage || null,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    });
    console.log('Password reset email logged successfully');
  } catch (logError) {
    console.error('Failed to log password reset email:', logError);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Send Password Reset Email Edge Function called at', new Date().toISOString());

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { employee_id, employee_name, employee_email, reset_link }: { employee_id?: string; employee_name: string; employee_email: string; reset_link: string } = requestBody;

    if (!employee_name || !employee_email || !reset_link) {
      console.error('Missing required fields in request body');
      return new Response(JSON.stringify({ error: 'employee_name, employee_email, and reset_link are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing password reset email for:', employee_email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Validate email format
    if (!employee_email.includes('@')) {
      console.error('Invalid email format:', employee_email);
      await logPasswordResetEmail(supabaseAdmin, employee_id || 'unknown', employee_email, 'failed', undefined, 'Invalid email format');
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate email content
    const emailSubject = 'Password Reset Request';
    const htmlEmail = generatePasswordResetEmailHTML(employee_name, reset_link);

    console.log('Prepared email for:', employee_email);

    // Send email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set, logging email as pending instead of sending');
      await logPasswordResetEmail(supabaseAdmin, employee_id || 'unknown', employee_email, 'pending', undefined, 'RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ message: 'Email logged as pending (Resend API key not configured)', warning: 'Set RESEND_API_KEY to enable actual email sending' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending email via Resend to:', employee_email);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'team@hrmsystem.com',
        to: [employee_email],
        subject: emailSubject,
        html: htmlEmail,
      }),
    });

    console.log('Resend API response status:', resendResponse.status);

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', resendResponse.status, errorText);
      const errorMessage = `Failed to send email: ${resendResponse.status} ${errorText}`;
      await logPasswordResetEmail(supabaseAdmin, employee_id || 'unknown', employee_email, 'failed', undefined, errorMessage);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendData = await resendResponse.json();
    console.log('Email sent successfully, Resend ID:', resendData.id);

    // Log successful send
    await logPasswordResetEmail(supabaseAdmin, employee_id || 'unknown', employee_email, 'sent', resendData.id);

    return new Response(JSON.stringify({ message: 'Password reset email sent successfully', resend_id: resendData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in send-password-reset-email:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
