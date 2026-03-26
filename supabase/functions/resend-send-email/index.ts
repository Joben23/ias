const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function sendEmailViaResend(to, subject, html, from = 'HR System <onboarding@resend.dev>') {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable is not set in Supabase');
    throw new Error('Email service not configured. RESEND_API_KEY not found in environment variables.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend API Error:', response.status, errorText);
    throw new Error(`Resend API failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight for public access (no auth required for verification codes)
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Ensure we have POST method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Only POST method is allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse JSON request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract fields
    const { to, email, subject, html, from } = body;
    const recipientEmail = to || email;

    // Validate required fields
    if (!recipientEmail || !subject || !html) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['to (or email)', 'subject', 'html']
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send email via Resend
    console.log(`Sending email to ${recipientEmail} with subject: ${subject}`);
    const result = await sendEmailViaResend(
      recipientEmail,
      subject,
      html,
      from
    );

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        ok: true,
        message: 'Email sent successfully',
        emailId: result.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in resend-send-email function:', error);
    
    // Return error response with details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: errorMessage,
        message: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});