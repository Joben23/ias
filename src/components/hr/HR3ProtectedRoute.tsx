import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * HR3 – Workforce Operations
 * Accessible to: All Employees, HR Staff, Admin
 * Purpose: Attendance, Leave requests, Basic scheduling
 * This is the daily-use module for all employees
 */
export function HR3ProtectedRoute({ children }: { children: React.ReactNode }) {
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
    return <Navigate to="/" replace state={{ from: '/hr3' }} />;
  }

  // HR3: All employees - employee, hr, admin roles
  // This is the most accessible module
  if (
    !['employee', 'hr', 'admin'].some(role => authUser.roles.includes(role))
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
