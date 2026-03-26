import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  role: string | null;
  avatar_url: string | null;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('[AUTH] Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[AUTH] Profile fetch error:', error.message);
        
        // FALLBACK: If profile doesn't exist, create one from auth user metadata
        console.log('[AUTH] Creating fallback profile from auth metadata');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const fallbackProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
            email: user.email,
            phone: user.user_metadata?.phone || null,
            department: user.user_metadata?.department || 'Human Resources',
            role: user.user_metadata?.role || 'employee',
            avatar_url: user.user_metadata?.avatar_url || null,
            must_change_password: !user.email_confirmed,
          };
          
          setProfile(fallbackProfile as Profile);
          console.log('[AUTH] Fallback profile created:', fallbackProfile);
          
          // Try to insert the profile into database for future use
          try {
            await supabase.from('profiles').insert(fallbackProfile);
            console.log('[AUTH] Fallback profile persisted to database');
          } catch (insertErr) {
            console.warn('[AUTH] Could not persist fallback profile:', insertErr);
          }
        }
        return;
      }

      if (data) {
        console.log('[AUTH] Profile loaded:', data.email);
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('[AUTH] Unexpected error fetching profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    console.log('[AUTH] Setting up auth listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('[AUTH] User logged in:', session.user.email);
          // Use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(() => {
            console.log('[AUTH] Fetching profile after auth state change');
            fetchProfile(session.user.id);
          }, 0);
        } else {
          console.log('[AUTH] User logged out');
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Then check for existing session
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('[AUTH] Existing session found:', session.user.email);
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('[AUTH] No existing session');
        }
      } catch (err) {
        console.error('[AUTH] Error checking session:', err);
      }
      setLoading(false);
    })();

    return () => {
      console.log('[AUTH] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
