import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { RotateCcw, Lock, Copy, Check } from 'lucide-react';

interface AdminResetPasswordDialogProps {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
}

export function AdminResetPasswordDialog({
  employeeId,
  employeeName,
  employeeEmail,
}: AdminResetPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [resetMethod, setResetMethod] = useState<'temporary' | 'email'>('temporary');

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    const password = Array.from({ length: 12 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    setTempPassword(password);
  };

  const handleTemporaryPasswordReset = async () => {
    if (!tempPassword) {
      toast({
        title: 'Error',
        description: 'Please generate a temporary password first',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Update user password using admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        employeeId,
        { password: tempPassword }
      );

      if (updateError) {
        toast({
          title: 'Error',
          description: updateError.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Mark user as must change password
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: true } as any)
        .eq('id', employeeId);

      if (profileError) {
        console.error('Error marking must change password:', profileError);
      }

      toast({
        title: 'Success',
        description: `Temporary password set for ${employeeName}. Employee must change it on next login.`,
      });

      setOpen(false);
      setTempPassword('');
      setCopied(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset password. Make sure you have admin permissions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetEmail = async () => {
    setLoading(true);
    try {
      // Send email directly via Edge Function
      const { error } = await supabase.functions.invoke('resend-send-email', {
        body: {
          to: employeeEmail,
          subject: 'Reset Your Password - HRMS System',
          html: `
            <html>
              <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0;">Reset Your Password</h1>
                  </div>
                  <div style="padding: 40px;">
                    <p>Hello ${employeeName},</p>
                    <p>An administrator has requested a password reset for your account. Click the link below to set a new password:</p>
                    <p style="margin-top: 30px;">
                      <a href="${window.location.origin}/auth/change-password" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                        Reset Password
                      </a>
                    </p>
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">This link expires in 24 hours. If you need assistance, contact your administrator.</p>
                  </div>
                  <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd;">
                    <p>HR Management System | Password Reset</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          from: 'team@hrmsystem.com',
        },
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to send password reset email',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Mark user as must change password
      await supabase
        .from('profiles')
        .update({ must_change_password: true } as any)
        .eq('id', employeeId);

      toast({
        title: 'Success',
        description: `Password reset email sent to ${employeeEmail}. Employee must change password on next login.`,
      });

      setLoading(false);
      setOpen(false);
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Employee Password</DialogTitle>
          <DialogDescription>
            Reset password for <span className="font-semibold text-foreground">{employeeName}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={resetMethod} onValueChange={(val) => setResetMethod(val as 'temporary' | 'email')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="temporary">Temporary Password</TabsTrigger>
            <TabsTrigger value="email">Email Reset Link</TabsTrigger>
          </TabsList>

          {/* Temporary Password Tab */}
          <TabsContent value="temporary" className="space-y-4">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Generate a temporary password and share it securely. The employee must change it on their next login.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={generateTemporaryPassword}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                Generate Temporary Password
              </Button>

              {tempPassword && (
                <div className="space-y-2">
                  <Label htmlFor="temp-pwd">Generated Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="temp-pwd"
                      type="text"
                      value={tempPassword}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this password securely with {employeeName.split(' ')[0]}
                  </p>
                </div>
              )}

              <Button
                onClick={handleTemporaryPasswordReset}
                disabled={loading || !tempPassword}
                className="w-full gradient-primary text-primary-foreground"
              >
                {loading ? 'Setting Password...' : 'Set Temporary Password'}
              </Button>
            </div>
          </TabsContent>

          {/* Email Reset Tab */}
          <TabsContent value="email" className="space-y-4">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Send a password reset link to {employeeEmail}. They can set their own new password.
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground">
              The employee will receive an email with instructions to reset their password. They must complete the reset on their next login.
            </p>

            <Button
              onClick={handlePasswordResetEmail}
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground"
            >
              {loading ? 'Sending Email...' : 'Send Password Reset Email'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
