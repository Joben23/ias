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

// Custom session for email+password authentication
export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  fullName?: string;
}

// Trusted device record
export interface TrustedDevice {
  userId: string;
  email: string;
  trustedUntil: number; // timestamp
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  authUser: AuthUser | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setAuthUser: (user: AuthUser | null) => void;
  isDeviceTrusted: (email: string) => boolean;
  trustDevice: (userId: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'ias_auth_user';
const TRUSTED_DEVICE_KEY = 'ias_trusted_device';
const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore auth session from localStorage on app load (ONLY ONCE)
  useEffect(() => {
    console.log('[AUTH] Initializing auth context');
    
    try {
      const storedAuthUser = localStorage.getItem(AUTH_USER_KEY);
      if (storedAuthUser) {
        const parsedUser: AuthUser = JSON.parse(storedAuthUser);
        console.log('[AUTH] Restored auth user from localStorage:', parsedUser.email);
        setAuthUserState(parsedUser);
      } else {
        console.log('[AUTH] No stored auth user found');
      }
    } catch (err) {
      console.error('[AUTH] Error restoring auth user:', err);
      localStorage.removeItem(AUTH_USER_KEY);
    }

    setLoading(false);
  }, []); // Empty dependency array - runs ONLY ONCE on mount

  const setAuthUser = (user: AuthUser | null) => {
    if (user) {
      console.log('[AUTH] Saving auth user to localStorage:', user.email);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      setAuthUserState(user);
    } else {
      console.log('[AUTH] Clearing auth user from localStorage');
      localStorage.removeItem(AUTH_USER_KEY);
      setAuthUserState(null);
    }
  };

  const isDeviceTrusted = (email: string): boolean => {
    try {
      const stored = localStorage.getItem(TRUSTED_DEVICE_KEY);
      if (!stored) return false;

      const device: TrustedDevice = JSON.parse(stored);
      const now = Date.now();

      // Check if device is still trusted
      if (device.email === email && now < device.trustedUntil) {
        console.log('[AUTH] Device is trusted for:', email);
        return true;
      } else if (device.email === email && now >= device.trustedUntil) {
        console.log('[AUTH] Device trust expired for:', email);
        localStorage.removeItem(TRUSTED_DEVICE_KEY);
        return false;
      }

      return false;
    } catch (err) {
      console.error('[AUTH] Error checking device trust:', err);
      return false;
    }
  };

  const trustDevice = (userId: string, email: string) => {
    const trustedDevice: TrustedDevice = {
      userId,
      email,
      trustedUntil: Date.now() + FOUR_DAYS_MS,
    };
    console.log('[AUTH] Trusting device for:', email, 'until:', new Date(trustedDevice.trustedUntil));
    localStorage.setItem(TRUSTED_DEVICE_KEY, JSON.stringify(trustedDevice));
  };

  const signOut = async () => {
    console.log('[AUTH] Signing out');
    console.log('[AUTH] Device trust persists for 4 days - not cleared on logout');
    setAuthUser(null);
    // DO NOT clear trustedDevice - it should persist for 4 days
    // localStorage.removeItem(TRUSTED_DEVICE_KEY);
    setProfile(null);
  };

  const fetchProfile = async (userId: string) => {
    // Kept for compatibility, but not needed for custom auth
    console.log('[AUTH] Fetching profile for user:', userId);
  };

  const refreshProfile = async () => {
    if (authUser) await fetchProfile(authUser.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        authUser,
        signOut,
        refreshProfile,
        setAuthUser,
        isDeviceTrusted,
        trustDevice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
