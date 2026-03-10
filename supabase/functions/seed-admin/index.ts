import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find existing admin
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingAdmin = existingUsers?.users?.find(u => u.email === "admin@medhire.local");

  if (existingAdmin) {
    // Ensure admin role exists
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', existingAdmin.id)
      .eq('role', 'admin')
      .single();
    
    if (!existingRole) {
      await supabaseAdmin.from('user_roles').insert({
        user_id: existingAdmin.id,
        role: 'admin',
      });
    }

    return new Response(JSON.stringify({ message: "Admin with username 'admin' already exists, role verified" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Delete old admin if exists
  const oldAdmin = existingUsers?.users?.find(u => u.email === "admin@medhire.com");
  if (oldAdmin) {
    await supabaseAdmin.auth.admin.deleteUser(oldAdmin.id);
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@medhire.local",
    password: "admin123",
    email_confirm: true,
    user_metadata: { full_name: "System Admin" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (data.user) {
    await supabaseAdmin.from("profiles").update({
      role: "Admin",
      department: "Administration",
      full_name: "System Admin",
    }).eq("id", data.user.id);

    // Assign admin role
    await supabaseAdmin.from('user_roles').insert({
      user_id: data.user.id,
      role: 'admin',
    });
  }

  return new Response(JSON.stringify({ message: "Admin created with username 'admin' and admin role assigned" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
