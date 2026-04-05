import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * HR2 – Talent Development
 * Accessible to: Employees, HR Staff, Admin
 * Purpose: Training, competency management, career development
 * Only hired employees can access this module
 */
export function HR2ProtectedRoute({ children }: { children: React.ReactNode }) {
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
    return <Navigate to="/" replace state={{ from: '/hr2' }} />;
  }

  // HR2: Employees (main users), HR staff - employee, hr, admin roles
  if (
    !['employee', 'hr', 'admin'].some(role => authUser.roles.includes(role))
  ) {
    // Redirect non-employees to HR1 (Talent Acquisition)
    return <Navigate to="/hr1/dashboard" replace />;
  }

  return <>{children}</>;
}
