import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hasRole(userId: string, role: string): Promise<boolean> {
  const normalizedRole = role.split(':')[0].toLowerCase().trim(); // remove unwanted suffixes like hr:1
  
  try {
    console.log('[ROLE-CHECK] Checking role:', { userId: userId.substring(0, 8) + '...', normalizedRole });
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', normalizedRole)
      .maybeSingle(); // Use maybeSingle to avoid errors on empty result

    if (error) {
      console.warn('[ROLE-CHECK] Error checking role:', error.message);
      return false;
    }

    const hasRole = !!data;
    console.log('[ROLE-CHECK] Result:', { hasRole, role: data?.role });
    return hasRole;
  } catch (err) {
    console.error('[ROLE-CHECK] Unexpected error:', err);
    return false;
  }
}

export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) return [];
    return data?.map(r => r.role) || [];
  } catch {
    return [];
  }
}
