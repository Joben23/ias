import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StaffLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffLoginModal({ open, onOpenChange }: StaffLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && open) {
      // Only redirect if the modal is actually open
      checkUserRoleAndRedirect(user.id);
    }
  }, [user, authLoading, open]);

  const checkUserRoleAndRedirect = async (userId: string) => {
    try {
      const [isAdmin, isHR, isEmployee] = await Promise.all([
        hasRole(userId, 'admin'),
        hasRole(userId, 'hr'),
        hasRole(userId, 'employee')
      ]);

      // Scroll to top before navigating
      window.scrollTo(0, 0);

      if (isAdmin || isHR) {
        navigate('/dashboard', { replace: true });
        onOpenChange(false);
      } else if (isEmployee) {
        navigate('/employee-portal', { replace: true });
        onOpenChange(false);
      } else {
        // No valid role, sign out
        await supabase.auth.signOut();
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this system.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      await supabase.auth.signOut();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Try direct email login first (for employees with real emails)
    let email = username;
    if (!email.includes('@')) {
      email = `${username}@medhire.local`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // If direct email fails and username doesn't contain @, try the old format
      if (!username.includes('@')) {
        const fallbackEmail = `${username}@medhire.local`;
        const { data: fallbackData, error: fallbackError } = await supabase.auth.signInWithPassword({
          email: fallbackEmail,
          password
        });

        if (fallbackError) {
          setLoading(false);
          toast({
            title: 'Login failed',
            description: 'Invalid username or password.',
            variant: 'destructive'
          });
          return;
        }

        // Check role for fallback login
        if (fallbackData.user) {
          await checkUserRoleAndRedirect(fallbackData.user.id);
        }
      } else {
        setLoading(false);
        toast({
          title: 'Login failed',
          description: 'Invalid username or password.',
          variant: 'destructive'
        });
      }
    } else {
      // Check role for direct email login
      if (data.user) {
        await checkUserRoleAndRedirect(data.user.id);
      }
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const emailBody = {
        to: resetEmail,
        subject: 'Reset Your Password - HRMS System',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; margin-top: 0;">Reset Your Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your HRMS account. Click the link below to reset it.</p>
                <p>
                  <a href="${window.location.origin}/auth/change-password" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Reset Password
                  </a>
                </p>
                <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email. This link expires in 24 hours.</p>
              </div>
            </body>
          </html>
        `,
        from: 'team@hrmsystem.com',
      };

      console.log('Calling resend-send-email function...');

      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('resend-send-email', {
        body: emailBody,
        headers: session?.access_token ? {
          'Authorization': `Bearer ${session.access_token}`
        } : {},
      });

      console.log('Function response:', { data, error });

      setResetLoading(false);

      if (error) {
        console.error('Function error details:', error);
        toast({
          title: 'Error Sending Email',
          description: `${error.message || 'Failed to send email. Please check Supabase Edge Function logs.'}`,
          variant: 'destructive',
        });
      } else if (data?.ok) {
        toast({
          title: 'Success!',
          description: 'Password reset email sent. Check your inbox for instructions.',
        });
        setShowReset(false);
        setResetEmail('');
      } else {
        toast({
          title: 'Error',
          description: data?.error || 'Failed to send password reset email.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setResetLoading(false);
      console.error('Caught error:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center">
            <div className="gradient-primary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HeartPulse className="w-7 h-7 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">Staff Access</DialogTitle>
            <DialogDescription>
              Login to access your employee portal
            </DialogDescription>
          </div>
        </DialogHeader>

        {!showReset ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email or Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your email or username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setShowReset(true)}
              >
                Forgot your password?
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReset(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={resetLoading}>
                {resetLoading ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}