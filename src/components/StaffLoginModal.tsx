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

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/`,
    });

    setResetLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send password reset email.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password reset sent',
        description: 'Check your email for password reset instructions.',
      });
      setShowReset(false);
      setResetEmail('');
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