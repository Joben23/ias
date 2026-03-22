import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log incoming request
    console.log('Hire Applicant Edge Function called');

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized - No auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { applicant_id } = await req.json();
    console.log('Incoming payload:', { applicant_id });

    if (!applicant_id) {
      console.error('Missing applicant_id in request');
      return new Response(JSON.stringify({ error: 'applicant_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase clients
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify calling user is authenticated and has HR/Admin role
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid auth token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    // Check if user has HR or Admin role
    const { data: userRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['hr', 'admin'])
      .single();

    if (roleCheckError || !userRole) {
      console.error('User does not have HR/Admin role:', user.id);
      return new Response(JSON.stringify({ error: 'Unauthorized - HR or Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User has required role:', userRole.role);

    // Get applicant data
    const { data: applicant, error: fetchError } = await supabaseAdmin
      .from('applicants')
      .select('*')
      .eq('id', applicant_id)
      .single();

    if (fetchError || !applicant) {
      console.error('Applicant fetch error:', fetchError);
      return new Response(JSON.stringify({ error: 'Applicant not found', details: fetchError?.message }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (applicant.status === 'Hired') {
      console.error('Applicant already hired:', applicant_id);
      return new Response(JSON.stringify({ error: 'Applicant is already hired' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing applicant:', {
      id: applicant.id,
      email: applicant.email,
      full_name: applicant.full_name,
      position: applicant.position_applied,
      department: applicant.department
    });

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(applicant.email);
    if (existingUser.user) {
      console.error('User already exists with email:', applicant.email);
      return new Response(JSON.stringify({ error: 'User already exists with this email' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate temporary password
    const tempPassword = `MedHire${Math.random().toString(36).slice(-6)}!`;
    console.log('Generated temporary password for:', applicant.email);

    // Create auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: applicant.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: applicant.full_name,
        department: applicant.department,
        position: applicant.position_applied
      },
    });

    if (createError) {
      console.error('Auth user creation failed:', createError);
      return new Response(JSON.stringify({
        error: 'Failed to create auth user',
        details: createError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Created auth user successfully:', newUser.user.id);

    // Assign employee role
    const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
      user_id: newUser.user.id,
      role: 'employee',
    });

    if (roleError) {
      console.error('Role assignment failed:', roleError);
      return new Response(JSON.stringify({
        error: 'Failed to assign employee role',
        details: roleError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Assigned employee role successfully');

    // Update/create profile
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: newUser.user.id,
      full_name: applicant.full_name,
      email: applicant.email,
      phone: applicant.phone,
      department: applicant.department,
      role: 'employee',
    }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile update failed:', profileError);
      return new Response(JSON.stringify({
        error: 'Failed to update profile',
        details: profileError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Profile updated successfully');

    // Get job offer details (be more permissive about status)
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('job_offers')
      .select('start_date, contract_type, salary_offer, status')
      .eq('applicant_id', applicant_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (offerError || !offer) {
      console.error('Job offer not found:', offerError);
      return new Response(JSON.stringify({
        error: 'Job offer not found. Please ensure offer is created before hiring.'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found job offer:', { start_date: offer.start_date, status: offer.status });

    // Generate employee ID
    const employeeId = `EMP-${Date.now()}-${Math.random().toString(36).slice(-4).toUpperCase()}`;

    // Create employee record
    const { error: employeeError } = await supabaseAdmin.from('employees').insert({
      user_id: newUser.user.id,
      applicant_id: applicant.id,
      employee_id: employeeId,
      full_name: applicant.full_name,
      email: applicant.email,
      phone: applicant.phone,
      position: applicant.position_applied,
      department: applicant.department,
      start_date: offer.start_date,
      status: 'Active',
    });

    if (employeeError) {
      console.error('Employee record creation failed:', employeeError);
      return new Response(JSON.stringify({
        error: 'Failed to create employee record',
        details: employeeError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Employee record created successfully:', employeeId);

    // Update applicant status to Hired
    const { error: updateError } = await supabaseAdmin
      .from('applicants')
      .update({ status: 'Hired' })
      .eq('id', applicant.id);

    if (updateError) {
      console.error('Applicant status update failed:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to update applicant status',
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Applicant status updated to Hired');

    // Success response
    const response = {
      success: true,
      message: 'Employee account created successfully',
      employee_id: employeeId,
      user_id: newUser.user.id,
      username: applicant.full_name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, ''),
      password: tempPassword,
      email: applicant.email,
      full_name: applicant.full_name,
      position: applicant.position_applied,
      department: applicant.department,
      start_date: offer.start_date,
      status: 'Active'
    };

    console.log('Hiring process completed successfully for:', applicant.email);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Unexpected error in hire-applicant function:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: err.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
