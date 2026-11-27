import type { ReactNode } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth, Login, type UserRole } from './modules/auth';
import { Dashboard } from './modules/dashboard/Dashboard';
import { AppLayout } from './components/layout/AppLayout';
import { inductionRoutes } from './modules/onboarding/routes/induction.routes';
import { LeaveManagement } from './modules/leave';
import { EmployeeDirectory, EmployeeDetailsPage } from './modules/employees';
import { AttendanceManagement } from './modules/attendance';
import { SettingsManagement } from './modules/settings';
import { RecruitmentPipeline } from './modules/recruitment/RecruitmentPipeline';
import { PayrollManagement, MyPayslips } from './modules/payroll';
import { LettersManagement } from './modules/letters';
function ProtectedRoute({
  children,
  withLayout = true,
  allowedRoles,
  requiredPermissions,
}: {
  children: ReactNode;
  withLayout?: boolean;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
}) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-xs">
        Loading workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles || requiredPermissions) {
    const roleAllowed =
      user.role === 'SUPER_ADMIN' || Boolean(allowedRoles?.includes(user.role));
    const permAllowed = Boolean(
      requiredPermissions?.some((perm) => hasPermission(perm)),
    );

    if (!roleAllowed && !permAllowed) {
      const deniedView = (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-rose-200 dark:border-rose-900/50 p-8 shadow-xs max-w-lg mx-auto text-center space-y-3 mt-10">
          <div className="text-xs font-black uppercase tracking-widest text-rose-600">
            403 &bull; Access Denied
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Permission Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You do not have the required role or permission to access this module. Contact your SuperAdmin if you need access.
          </p>
        </div>
      );
      return withLayout ? <AppLayout>{deniedView}</AppLayout> : deniedView;
    }
  }

  return withLayout ? <AppLayout>{children}</AppLayout> : children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      <Route path="/login" element={<Login />} />

      {/* Authenticated Routes wrapped in AppLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {inductionRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute withLayout={false}>{element}</ProtectedRoute>}
        />
      ))}
      <Route
        path="/employees"
        element={
          <ProtectedRoute
            requiredPermissions={['employees:manage_all', 'documents:vault_all']}
          >
            <EmployeeDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute
            requiredPermissions={['employees:manage_all', 'documents:vault_all']}
          >
            <EmployeeDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendanceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <ProtectedRoute>
            <LeaveManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll"
        element={
          <ProtectedRoute
            requiredPermissions={['payroll:run', 'payroll:salary_manage']}
          >
            <PayrollManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/official-letters"
        element={
          <ProtectedRoute>
            <MyPayslips />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-payslips"
        element={<Navigate to="/official-letters" replace />}
      />
      <Route
        path="/recruitment"
        element={
          <ProtectedRoute
            requiredPermissions={['recruitment:manage_all', 'recruitment:question_bank_manage']}
          >
            <RecruitmentPipeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/letters"
        element={
          <ProtectedRoute
            requiredPermissions={['letters:release']}
          >
            <LettersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute
            requiredPermissions={['roles:manage']}
          >
            <SettingsManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  );
}
