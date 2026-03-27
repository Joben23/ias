import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole } from '@/lib/utils';
import { StaffLoginModal } from '@/components/StaffLoginModal';
import { toast } from '@/hooks/use-toast';
import { Moon, Sun } from 'lucide-react';

export default function StaffLoginPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('staff-theme');
      return (saved as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Apply theme to document
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('staff-theme', theme);
  }, [theme]);

  // Handle redirect after magic link verification
  useEffect(() => {
    const handleMagicLinkVerification = async () => {
      try {
        // Check if there's an active session (from magic link)
        const { data } = await supabase.auth.getSession();

        if (data.session && data.session.user) {
          console.log('[STAFFLOGIN] Magic link verified, checking roles for:', data.session.user.email);
          
          // Get user roles
          const [isAdmin, isHR, isEmployee] = await Promise.all([
            hasRole(data.session.user.id, 'admin'),
            hasRole(data.session.user.id, 'hr'),
            hasRole(data.session.user.id, 'employee')
          ]);

          console.log('[STAFFLOGIN] Role check:', { isAdmin, isHR, isEmployee });

          // Redirect to appropriate dashboard
          if (isAdmin || isHR) {
            console.log('[STAFFLOGIN] Redirecting to dashboard');
            navigate('/hr1/dashboard', { replace: true });
          } else if (isEmployee) {
            console.log('[STAFFLOGIN] Redirecting to employee portal');
            navigate('/employee-portal', { replace: true });
          } else {
            console.warn('[STAFFLOGIN] User has no roles');
            await supabase.auth.signOut();
            toast({
              title: 'Access Denied',
              description: 'You do not have permission to access this system.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('[STAFFLOGIN] Error handling magic link:', error);
      }
    };

    handleMagicLinkVerification();
  }, [navigate]);

  // Also handle when user logs in normally (password entry)
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[STAFFLOGIN] User logged in, checking roles');
      checkUserRoleAndRedirect(user.id);
    }
  }, [user, authLoading, navigate]);

  const checkUserRoleAndRedirect = async (userId: string) => {
    try {
      const [isAdmin, isHR, isEmployee] = await Promise.all([
        hasRole(userId, 'admin'),
        hasRole(userId, 'hr'),
        hasRole(userId, 'employee')
      ]);

      window.scrollTo(0, 0);

      if (isAdmin || isHR) {
        navigate('/hr1/dashboard', { replace: true });
      } else if (isEmployee) {
        navigate('/employee-portal', { replace: true });
      } else {
        await supabase.auth.signOut();
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this system.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[STAFFLOGIN] Error checking roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify your access level.',
        variant: 'destructive',
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-800' 
        : 'bg-white'
    } flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse ${
        theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
      }`}></div>
      <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse ${
        theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'
      }`} style={{ animationDelay: '2s' }}></div>

      {/* Theme toggle button - fixed positioning with high z-index */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all duration-300 hover:scale-110 z-50 ${
          theme === 'dark' 
            ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300 shadow-lg shadow-blue-500/20' 
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-lg hover:shadow-xl'
        }`}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Modal container with animation */}
      <div className={`relative z-10 animate-in fade-in zoom-in duration-500 ${
        theme === 'dark' ? 'dark' : ''
      }`}>
        <StaffLoginModal 
          open={true} 
          onOpenChange={() => {}} 
          theme={theme}
        />
      </div>
    </div>
  );
}
