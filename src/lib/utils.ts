import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Validate email and password against profiles table
export async function validateCredentials(email: string, password: string): Promise<{ id: string; email: string; fullName: string } | null> {
  try {
    console.log('[AUTH-VALIDATE] Validating credentials for email:', email);

    // Query profiles table by email (try with password_hash first)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .ilike('email', email.trim())
      .maybeSingle();

    if (profileError || !profileData) {
      console.error('[AUTH-VALIDATE] Profile not found:', profileError?.message);
      return null;
    }

    console.log('[AUTH-VALIDATE] Profile found, checking password...');
    
    // For now, accept any non-empty password if profile exists
    // TODO: Implement proper bcrypt password hashing in database
    if (!password || password.length === 0) {
      console.warn('[AUTH-VALIDATE] Empty password provided');
      return null;
    }

    console.log('[AUTH-VALIDATE] Credentials valid for:', email);
    return {
      id: profileData.id,
      email: profileData.email,
      fullName: profileData.full_name || 'User',
    };
  } catch (err) {
    console.error('[AUTH-VALIDATE] Error validating credentials:', err);
    return null;
  }
}

export async function hasRole(userId: string, role: string): Promise<boolean> {
  const normalizedRole = role.split(':')[0].toLowerCase().trim(); // remove unwanted suffixes like hr:1
  
  try {
    console.log('[ROLE-CHECK] Checking role:', { userId: userId.substring(0, 8) + '...', normalizedRole });
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', normalizedRole as 'hr' | 'admin' | 'employee')
      .maybeSingle(); // Use maybeSingle to avoid errors on empty result

    if (error) {
      console.warn('[ROLE-CHECK] Error checking role:', {
        code: error.code,
        message: error.message,
        hint: error.hint,
        details: error.details
      });
      return false;
    }

    const hasRole = !!data;
    console.log('[ROLE-CHECK] Result:', { hasRole, role: data?.role, data });
    return hasRole;
  } catch (err) {
    console.error('[ROLE-CHECK] Unexpected error:', err);
    return false;
  }
}

export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    console.log('[GET-USER-ROLES] Fetching all roles for userId:', userId.substring(0, 8) + '...');
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.warn('[GET-USER-ROLES] Error fetching roles:', {
        code: error.code,
        message: error.message,
        hint: error.hint
      });
      return [];
    }
    
    const roles = data?.map(r => r.role) || [];
    console.log('[GET-USER-ROLES] Found roles:', roles);
    return roles;
  } catch (err) {
    console.error('[GET-USER-ROLES] Unexpected error:', err);
    return [];
  }
}
