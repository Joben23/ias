import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[HIRE] Function started');
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[HIRE] Missing env vars');
      return new Response(
        JSON.stringify({ error: 'Missing configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Parse request
    const { applicant_id } = await req.json();
    
    if (!applicant_id) {
      return new Response(
        JSON.stringify({ error: 'applicant_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[HIRE] Processing applicant:', applicant_id);

    // 1. Get applicant
    const { data: applicant, error: applicantError } = await supabase
      .from('applicants')
      .select('*')
      .eq('id', applicant_id)
      .single();

    if (applicantError || !applicant) {
      console.error('[HIRE] Applicant error:', applicantError);
      return new Response(
        JSON.stringify({ error: 'Applicant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check if already hired
    if (applicant.status === 'Hired') {
      return new Response(
        JSON.stringify({ error: 'Already hired' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check if auth user exists
    try {
      const { data: existing } = await supabase.auth.admin.getUserByEmail(applicant.email);
      if (existing?.user) {
        return new Response(
          JSON.stringify({ error: 'User exists' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (e) {
      console.log('[HIRE] User check OK - no existing user');
    }

    // 4. Generate credentials
    const password = `MedHire${Math.random().toString(36).substr(-8)}!`;
    const employeeId = `EMP-${Date.now()}-${Math.random().toString(36).substr(-4).toUpperCase()}`;

    console.log('[HIRE] Creating auth user:', applicant.email);

    // 5. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: applicant.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: applicant.full_name,
        department: applicant.department,
        position: applicant.position_applied,
      },
    });

    if (authError) {
      console.error('[HIRE] Auth error:', authError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to create auth user', details: authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.user.id;
    console.log('[HIRE] Auth user created:', userId);

    // 6. Assign role (non-blocking)
    try {
      await supabase.from('user_roles').insert({
        user_id: userId,
        role: 'employee',
      });
      console.log('[HIRE] Role assigned');
    } catch (e) {
      console.log('[HIRE] Role assignment skipped:', e);
    }

    // 7. Create/update profile (non-blocking)
    try {
      await supabase.from('profiles').upsert(
        {
          id: userId,
          full_name: applicant.full_name,
          email: applicant.email,
          phone: applicant.phone,
          department: applicant.department,
          role: 'employee',
        },
        { onConflict: 'id' }
      );
      console.log('[HIRE] Profile created');
    } catch (e) {
      console.log('[HIRE] Profile creation skipped:', e);
    }

    // 8. Get job offer (use defaults if not found)
    let startDate = new Date().toISOString().split('T')[0];
    try {
      const { data: offers } = await supabase
        .from('job_offers')
        .select('start_date')
        .eq('applicant_id', applicant_id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (offers?.length > 0 && offers[0].start_date) {
        startDate = offers[0].start_date;
        console.log('[HIRE] Job offer found');
      }
    } catch (e) {
      console.log('[HIRE] Offer fetch skipped:', e);
    }

    // 9. Create employee record
    console.log('[HIRE] Creating employee record');
    const { error: empError } = await supabase.from('employees').insert({
      user_id: userId,
      applicant_id: applicant.id,
      employee_id: employeeId,
      full_name: applicant.full_name,
      email: applicant.email,
      phone: applicant.phone,
      position: applicant.position_applied,
      department: applicant.department,
      start_date: startDate,
      status: 'Active',
      onboarding_status: 'Pending',
    });

    if (empError) {
      console.error('[HIRE] Employee error:', empError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to create employee', details: empError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[HIRE] Employee created:', employeeId);

    // 10. Update applicant to Hired (non-blocking)
    try {
      await supabase.from('applicants').update({ status: 'Hired' }).eq('id', applicant.id);
      console.log('[HIRE] Applicant marked as hired');
    } catch (e) {
      console.log('[HIRE] Applicant update skipped:', e);
    }

    // Success!
    console.log('[HIRE] SUCCESS');
    return new Response(
      JSON.stringify({
        success: true,
        employee_id: employeeId,
        user_id: userId,
        username: applicant.full_name.toLowerCase().replace(/\s+/g, '.'),
        password: password,
        email: applicant.email,
        start_date: startDate,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[HIRE] ERROR:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
