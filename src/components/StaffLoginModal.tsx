import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse, Mail, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StaffLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: 'light' | 'dark';
}

export function StaffLoginModal({ open, onOpenChange, theme = 'light' }: StaffLoginModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [codeExpiry, setCodeExpiry] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Countdown timer
  useEffect(() => {
    if (!codeExpiry) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((codeExpiry - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setStep('email');
        setCodeExpiry(null);
        toast({
          title: 'Link Expired',
          description: 'Verification link has expired. Please request a new one.',
          variant: 'destructive',
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [codeExpiry]);

  useEffect(() => {
    if (!authLoading && user && open) {
      checkUserRoleAndRedirect(user.id);
    }
  }, [user, authLoading, open]);

  const checkUserRoleAndRedirect = async (userId: string) => {
    try {
      console.log('[LOGIN] Checking user roles for:', userId.substring(0, 8) + '...');
      
      const [isAdmin, isHR, isEmployee] = await Promise.all([
        hasRole(userId, 'admin'),
        hasRole(userId, 'hr'),
        hasRole(userId, 'employee')
      ]);

      console.log('[LOGIN] Role check results:', { isAdmin, isHR, isEmployee });

      window.scrollTo(0, 0);

      if (isAdmin || isHR) {
        console.log('[LOGIN] Redirecting to dashboard');
        navigate('/dashboard', { replace: true });
        onOpenChange(false);
      } else if (isEmployee) {
        console.log('[LOGIN] Redirecting to employee portal');
        navigate('/employee-portal', { replace: true });
        onOpenChange(false);
      } else {
        console.warn('[LOGIN] No valid roles');
        await supabase.auth.signOut();
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this system. Please contact HR.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[LOGIN] Error checking roles:', error);
      await supabase.auth.signOut();
      toast({
        title: 'Error',
        description: 'Failed to verify your access level. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const sendVerificationLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: { shouldCreateUser: false },
      });

      if (error) {
        toast({
          title: 'Failed to Send Link',
          description: error.message || 'Could not send verification link. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const expiryTime = Date.now() + 10 * 60 * 1000;
      setCodeExpiry(expiryTime);
      setTimeRemaining(600);
      setStep('code');

      toast({
        title: 'Link Sent',
        description: `A verification link has been sent to ${email}. Click the link to verify. It will expire in 10 minutes.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('[2FA] Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resendLink = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: { shouldCreateUser: false },
      });

      if (error) {
        toast({
          title: 'Failed to Resend Link',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const expiryTime = Date.now() + 10 * 60 * 1000;
      setCodeExpiry(expiryTime);
      setTimeRemaining(600);

      toast({
        title: 'Link Resent',
        description: `A new verification link has been sent to ${email}.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="w-full max-w-md transition-all duration-500">
      <div className={`rounded-2xl shadow-2xl border transition-all duration-300 ${
        isDark 
          ? 'bg-slate-800 border-slate-700 shadow-xl' 
          : 'bg-white border-slate-300 shadow-xl'
      }`}>
        {/* Header */}
        <div className={`p-8 pb-6 text-center border-b transition-colors duration-300 ${
          isDark ? 'border-slate-700/50' : 'border-slate-200/50'
        }`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-500 hover:scale-110 ${
            isDark 
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30' 
              : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20'
          }`}>
            <HeartPulse className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className={`text-2xl font-bold mb-1 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Staff Access
          </h2>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {step === 'email' && 'Enter your email to receive a verification link'}
            {step === 'code' && 'Click the verification link sent to your email'}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Step 1: Email Entry */}
          {step === 'email' && (
            <form onSubmit={sendVerificationLink} className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="email" className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`pl-10 h-11 rounded-lg ${
                      isDark 
                        ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                }`}
                disabled={loading || !email}
              >
                {loading ? 'Sending…' : 'Send Link'}
              </Button>
            </form>
          )}

          {/* Step 2: Check Email */}
          {step === 'code' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className={`p-4 rounded-xl flex gap-3 ${
                isDark 
                  ? 'bg-blue-900/30 border border-blue-800/50' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <Clock className={`w-5 h-5 flex-shrink-0 mt-0.5 animate-spin ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div className="text-sm">
                  <p className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                    Link expires in
                  </p>
                  <p className={`text-lg font-mono ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                    {timeRemaining 
                      ? `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}` 
                      : 'Expired'}
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto animate-bounce ${
                  isDark 
                    ? 'bg-blue-900/50'
                    : 'bg-blue-100'
                }`}>
                  <Mail className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Check Your Email
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Click the verification link sent to<br /><span className="font-semibold">{email}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('email');
                    setCodeExpiry(null);
                  }}
                  className={isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : ''}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resendLink}
                  className={isDark ? 'flex-1 bg-slate-700 border-slate-600 text-slate-200' : 'flex-1'}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Resend'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
