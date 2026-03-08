import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find existing admin
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const oldAdmin = existingUsers?.users?.find(u => u.email === "admin@medhire.com");
  const newAdmin = existingUsers?.users?.find(u => u.email === "admin@medhire.local");

  if (newAdmin) {
    return new Response(JSON.stringify({ message: "Admin with username 'admin' already exists" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Delete old admin if exists, then create new one
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
      headers: { "Content-Type": "application/json" },
    });
  }

  if (data.user) {
    await supabaseAdmin.from("profiles").update({
      role: "Admin",
      department: "Administration",
      full_name: "System Admin",
    }).eq("id", data.user.id);
  }

  return new Response(JSON.stringify({ message: "Admin created with username 'admin'" }), {
    headers: { "Content-Type": "application/json" },
  });
});
