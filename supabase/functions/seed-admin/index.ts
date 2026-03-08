import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Check if admin already exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const adminExists = existingUsers?.users?.some(u => u.email === "admin@medhire.com");

  if (adminExists) {
    return new Response(JSON.stringify({ message: "Admin already exists" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@medhire.com",
    password: "admin123",
    email_confirm: true,
    user_metadata: { full_name: "System Admin" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Update profile with admin role
  if (data.user) {
    await supabaseAdmin.from("profiles").update({
      role: "Admin",
      department: "Administration",
      full_name: "System Admin",
    }).eq("id", data.user.id);
  }

  return new Response(JSON.stringify({ message: "Admin created successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
});
