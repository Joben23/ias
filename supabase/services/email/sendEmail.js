// Backend email service using Resend API
// IMPORTANT: This module is BACKEND ONLY - Never import or use from frontend React code
// Environment variable: RESEND_API_KEY must be set in Supabase or Node.js environment

export async function sendEmail(to, subject, html, from = 'HR System <onboarding@resend.dev>') {
  // Get API key from environment (Deno in Supabase or Node.js process)
  const resendApiKey = typeof Deno !== 'undefined' 
    ? Deno.env.get('RESEND_API_KEY')
    : process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    const error = new Error('RESEND_API_KEY environment variable is not configured. Please set it in your Supabase/Node.js environment.');
    console.error('Email Configuration Error:', error.message);
    throw error;
  }

  try {
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
      throw new Error(`Resend API failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Email sent successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}