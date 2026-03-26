import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Professional HTML email template
function generateInterviewInvitationHTML(applicantName: string, positionApplied: string, interviewDate: string, interviewTime: string, interviewType: string, locationOrMeeting: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Invitation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .detail-box { background-color: #f9f9f9; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
    .detail-label { font-weight: 600; color: #555; }
    .detail-value { color: #333; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
    .important-note { background-color: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #856404; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Interview Invitation</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">We're excited to meet with you!</p>
    </div>
    
    <div class="content">
      <p class="greeting">Dear <strong>${applicantName}</strong>,</p>
      
      <p>We are pleased to invite you to an interview for the position of <strong>${positionApplied}</strong>. Your qualifications impressed our team, and we would like to learn more about your experience and skills.</p>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">📅 Interview Date:</span>
          <span class="detail-value">${interviewDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏰ Interview Time:</span>
          <span class="detail-value">${interviewTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🎯 Interview Type:</span>
          <span class="detail-value">${interviewType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">${interviewType === 'Online' ? '🔗 Meeting Link' : '📍 Location'}:</span>
          <span class="detail-value">${locationOrMeeting}</span>
        </div>
      </div>
      
      <div class="important-note">
        <strong>📝 Before the Interview:</strong><br>
        Please ensure you have a stable internet connection. If you're joining online, test your audio and video. If joining on-site, please plan to arrive 10 minutes early.
      </div>
      
      <p>If you have any questions or need to reschedule, please don't hesitate to contact us.</p>
      
      <p style="margin-top: 30px;">Best regards,<br><strong>Human Resources Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email. Contact HR at hr@hospital.local for inquiries.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function logEmailSend(supabaseAdmin: any, interviewId: string, applicantId: string, recipientEmail: string, subject: string, status: string, resendId?: string, errorMessage?: string) {
  try {
    await supabaseAdmin.from('email_logs').insert({
      interview_id: interviewId,
      applicant_id: applicantId,
      recipient_email: recipientEmail,
      subject,
      template_type: 'interview_invitation',
      status,
      resend_id: resendId || null,
      error_message: errorMessage || null,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    });
    console.log('Email log created successfully');
  } catch (logError) {
    console.error('Failed to log email:', logError);
  }
}

async function updateInterviewEmailStatus(supabaseAdmin: any, interviewId: string, emailSent: boolean, resendId?: string) {
  try {
    await supabaseAdmin.from('interviews').update({
      email_sent: emailSent,
      email_sent_at: emailSent ? new Date().toISOString() : null,
      last_email_resend_id: resendId || null,
    }).eq('id', interviewId);
    console.log('Interview email status updated');
  } catch (updateError) {
    console.error('Failed to update interview email status:', updateError);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Send Interview Notification Edge Function called at', new Date().toISOString());

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('No authorization header provided - proceeding without auth (for debugging)');
    }

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

    const { interview_id }: { interview_id: string } = requestBody;
    if (!interview_id) {
      console.error('Missing interview_id in request body');
      return new Response(JSON.stringify({ error: 'interview_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing notification for interview_id:', interview_id);

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

    // Fetch interview details
    const { data: interview, error: interviewError } = await supabaseAdmin
      .from('interviews')
      .select('*')
      .eq('id', interview_id)
      .single();

    if (interviewError) {
      console.error('Error fetching interview:', interviewError);
      return new Response(JSON.stringify({ error: 'Interview not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!interview) {
      console.error('No interview data returned for id:', interview_id);
      return new Response(JSON.stringify({ error: 'Interview not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetched interview details:', { id: interview.id, applicant_id: interview.applicant_id });

    // Fetch applicant details
    const { data: applicant, error: applicantError } = await supabaseAdmin
      .from('applicants')
      .select('full_name, email, position_applied')
      .eq('id', interview.applicant_id)
      .single();

    if (applicantError) {
      console.error('Error fetching applicant:', applicantError);
      await logEmailSend(supabaseAdmin, interview_id, interview.applicant_id, 'unknown', 'Interview Invitation', 'failed', undefined, 'Applicant not found');
      return new Response(JSON.stringify({ error: 'Applicant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!applicant) {
      console.error('No applicant data returned for id:', interview.applicant_id);
      await logEmailSend(supabaseAdmin, interview_id, interview.applicant_id, 'unknown', 'Interview Invitation', 'failed', undefined, 'Applicant data not found');
      return new Response(JSON.stringify({ error: 'Applicant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetched applicant details:', { name: applicant.full_name, email: applicant.email });

    if (!applicant.email) {
      console.error('Applicant has no email address');
      await logEmailSend(supabaseAdmin, interview_id, interview.applicant_id, 'no-email', 'Interview Invitation', 'failed', undefined, 'Applicant has no email address');
      return new Response(JSON.stringify({ error: 'Applicant email not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare email content
    const locationOrLink = interview.interview_type === 'Online' ? (interview.meeting_link || 'TBD') : (interview.location || 'TBD');

    // Format date safely
    let formattedDate = 'TBD';
    try {
      if (interview.interview_date) {
        formattedDate = new Date(interview.interview_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (dateError) {
      console.warn('Failed to format interview date:', dateError);
    }

    const emailSubject = 'Your Interview Has Been Scheduled';
    const htmlEmail = generateInterviewInvitationHTML(
      applicant.full_name,
      applicant.position_applied || 'N/A',
      formattedDate,
      interview.interview_time || 'TBD',
      interview.interview_type || 'TBD',
      locationOrLink
    );

    console.log('Prepared email for:', applicant.email);

    // Send email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set, logging email as pending instead of sending');
      await logEmailSend(supabaseAdmin, interview_id, interview.applicant_id, applicant.email, emailSubject, 'pending', undefined, 'RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ message: 'Email logged as pending (Resend API key not configured)', warning: 'Set RESEND_API_KEY to enable actual email sending' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending email via Resend to:', applicant.email);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HR Team <onboarding@resend.dev>',
        to: [applicant.email],
        subject: emailSubject,
        html: htmlEmail,
      }),
    });

    console.log('Resend API response status:', resendResponse.status);

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', resendResponse.status, errorText);
      const errorMessage = `Failed to send email: ${resendResponse.status} ${errorText}`;
      await logEmailSend(supabaseAdmin, interview_id, interview.applicant_id, applicant.email, emailSubject, 'failed', undefined, errorMessage);
      await updateInterviewEmailStatus(supabaseAdmin, interview_id, false);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendData = await resendResponse.json();
    console.log('Email sent successfully, Resend ID:', resendData.id);

    // Log successful send
    await logEmailSend(supabaseAdmin, interview_id, interview.applicant_id, applicant.email, emailSubject, 'sent', resendData.id);
    await updateInterviewEmailStatus(supabaseAdmin, interview_id, true, resendData.id);

    return new Response(JSON.stringify({ message: 'Notification sent successfully', resend_id: resendData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in send-interview-notification:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});