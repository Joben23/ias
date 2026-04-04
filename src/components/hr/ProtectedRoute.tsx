import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-primary w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Require authenticated user
  if (!authUser) {
    return <Navigate to="/" replace state={{ from: '/dashboard' }} />;
  }

  // Check if user has admin/hr roles
  if (!authUser.roles.includes('admin') && !authUser.roles.includes('hr')) {
    return <Navigate to="/employee-portal" replace />;
  }

  return <>{children}</>;
}
