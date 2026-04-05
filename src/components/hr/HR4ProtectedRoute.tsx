import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * HR4 – Compensation & HR Intelligence
 * Accessible to: Admin / HR Manager only
 * Purpose: Salary records, Payroll, Benefits
 * NOT accessible to regular employees
 */
export function HR4ProtectedRoute({ children }: { children: React.ReactNode }) {
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
    return <Navigate to="/" replace state={{ from: '/hr4' }} />;
  }

  // HR4: Admin / HR Manager only - strict access control
  if (
    !['admin', 'hr_manager', 'hr'].some(role => authUser.roles.includes(role))
  ) {
    // If employee, redirect to HR3 (Workforce Operations)
    if (authUser.roles.includes('employee')) {
      return <Navigate to="/hr3/dashboard" replace />;
    }
    // Otherwise redirect to login
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
