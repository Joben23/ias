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
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify calling user is authenticated
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: callingUser } } = await supabaseUser.auth.getUser();
    if (!callingUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { applicant_id } = await req.json();
    if (!applicant_id) {
      return new Response(JSON.stringify({ error: 'applicant_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get applicant
    const { data: applicant, error: fetchError } = await supabaseAdmin
      .from('applicants')
      .select('*')
      .eq('id', applicant_id)
      .single();

    if (fetchError || !applicant) {
      return new Response(JSON.stringify({ error: 'Applicant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate credentials
    const username = applicant.full_name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
    const password = `MedHire${Math.random().toString(36).slice(-6)}!`;
    const email = `${username}@medhire.local`;

    // Create auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: applicant.full_name },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Assign employee role
    await supabaseAdmin.from('user_roles').insert({
      user_id: newUser.user.id,
      role: 'employee',
    });

    // Update profile
    await supabaseAdmin.from('profiles').update({
      full_name: applicant.full_name,
      role: applicant.position_applied,
      department: applicant.department,
      phone: applicant.phone,
    }).eq('id', newUser.user.id);

    // Generate employee ID
    const { count } = await supabaseAdmin
      .from('employees')
      .select('*', { count: 'exact', head: true });
    const empNum = String((count || 0) + 1).padStart(4, '0');
    const employeeId = `EMP-${empNum}`;

    // Create employee record
    await supabaseAdmin.from('employees').insert({
      user_id: newUser.user.id,
      applicant_id: applicant.id,
      employee_id: employeeId,
      full_name: applicant.full_name,
      email: applicant.email,
      phone: applicant.phone,
      position: applicant.position_applied,
      department: applicant.department,
    });

    // Update applicant status to Hired
    await supabaseAdmin.from('applicants').update({ status: 'Hired' }).eq('id', applicant.id);

    return new Response(JSON.stringify({
      message: 'Employee account created',
      employee_id: employeeId,
      username,
      password,
      position: applicant.position_applied,
      department: applicant.department,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
