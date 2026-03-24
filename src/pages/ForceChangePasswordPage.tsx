import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordSection } from '@/components/ChangePasswordSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForceChangePasswordPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and user is not authenticated, redirect to login
    if (!loading && !user) {
      navigate('/');
    }

    // If password change is not required, redirect to portal
    if (!loading && user && profile && !profile.must_change_password) {
      navigate('/employee-portal');
    }
  }, [user, loading, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-primary w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user || !profile?.must_change_password) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground">Password Reset Required</h1>
            <p className="text-muted-foreground mt-2">
              Your password has been reset by an administrator. You must change it before continuing.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-300">
              For security reasons, you must change your password before accessing the employee portal.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Update Your Password</CardTitle>
              <CardDescription>
                Please provide your current password and set a new one. Your new password must be at least 6 characters long.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordSection />
            </CardContent>
          </Card>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-foreground mb-2">Password Requirements:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ At least 6 characters long</li>
              <li>✓ Must be different from your previous password</li>
              <li>✓ You'll need this password to log in</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
