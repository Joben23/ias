import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeProtectedRouteProps {
  children: React.ReactNode;
}

export function EmployeeProtectedRoute({ children }: EmployeeProtectedRouteProps) {
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
    return <Navigate to="/" replace state={{ from: '/employee-portal' }} />;
  }

  // Check if user has employee role
  if (!authUser.roles.includes('employee')) {
    return <Navigate to="/hr1/dashboard" replace />;
  }

  return <>{children}</>;
}