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
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(employeeEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Mark user as must change password
        await supabase
          .from('profiles')
          .update({ must_change_password: true } as any)
          .eq('id', employeeId);

        toast({
          title: 'Success',
          description: `Password reset email sent to ${employeeEmail}. Employee must change password on next login.`,
        });

        setOpen(false);
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      });
    } finally {
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
