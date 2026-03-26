import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { hasRole } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a moment for Supabase to process the magic link
        await new Promise(resolve => setTimeout(resolve, 500));

        // Supabase automatically exchanges the token in the URL for a session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AUTH_CALLBACK] Error getting session:', error);
          toast({
            title: 'Verification Failed',
            description: 'The verification link is invalid or has expired. Please request a new one.',
            variant: 'destructive',
          });
          navigate('/', { replace: true });
          return;
        }

        if (data.session && data.session.user) {
          console.log('[AUTH_CALLBACK] Email verified successfully:', data.session.user.email);
          
          // Check user role and redirect to appropriate dashboard
          const userId = data.session.user.id;
          const [isAdmin, isHR, isEmployee] = await Promise.all([
            hasRole(userId, 'admin'),
            hasRole(userId, 'hr'),
            hasRole(userId, 'employee')
          ]);

          const targetPath = (isAdmin || isHR) ? '/dashboard' : (isEmployee ? '/employee-portal' : '/');
          
          toast({
            title: 'Login Successful ✓',
            description: 'Welcome back! Redirecting to your dashboard...',
            variant: 'default',
          });
          
          setTimeout(() => {
            navigate(targetPath, { replace: true });
          }, 1000);
        } else {
          console.warn('[AUTH_CALLBACK] No session found after link click');
          toast({
            title: 'Verification Failed',
            description: 'Could not verify your email. Please try again.',
            variant: 'destructive',
          });
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('[AUTH_CALLBACK] Error:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  );
}
