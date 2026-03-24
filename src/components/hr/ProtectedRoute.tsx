import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-primary w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace state={{ from: '/dashboard' }} />;

  // Check if user must change password
  if (profile?.must_change_password) {
    return <Navigate to="/auth/change-password" replace />;
  }

  return <>{children}</>;
}
