import type { ReactNode } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, Login } from './modules/auth';
import { Dashboard } from './modules/dashboard/Dashboard';
import { AppLayout } from './components/layout/AppLayout';
import { Induction } from './modules/onboarding/Induction';
import { LeaveManagement } from './modules/leave';
import { EmployeeDirectory } from './modules/employees';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

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

  return <AppLayout>{children}</AppLayout>;
}

function SectionPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      <p className="text-xs text-slate-500 mt-1 mb-6">{description}</p>
      <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center justify-between">
        <span>Connected to Mark Anthony Ventures NestJS Backend &bull; Postgres Connected</span>
        <span className="font-bold text-[11px] bg-white px-2.5 py-1 rounded-md border border-orange-200">
          Ready for API Integration
        </span>
      </div>
    </div>
  );
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
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeeDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <SectionPlaceholder
              title="Attendance & Time Management"
              description="Face-scan gate lock webhook sync (First-in, last-out), CRM site visit ingestion & latecomer alerts."
            />
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
          <ProtectedRoute>
            <SectionPlaceholder
              title="Simplified Payroll Engine"
              description="DRAFT → LOCKED (Super Admin) → PAID state machine, auto-LOP calculation & automated PDF payslip emails."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment"
        element={
          <ProtectedRoute>
            <SectionPlaceholder
              title="Hiring & Recruitment Pipeline"
              description="Candidate pipeline (Applied → HR → Tech → Selected), calendar invites & structured scorecards."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/training"
        element={
          <ProtectedRoute>
            <Induction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/letters"
        element={
          <ProtectedRoute>
            <SectionPlaceholder
              title="Automated Letters Releasing"
              description="One-click PDF generation and email release of Offer & Experience Letters with audit logs."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SectionPlaceholder
              title="Master Settings & Access Control"
              description="Manage Users, RBAC permissions, Departments, Designations & Shift grace periods."
            />
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
    </AuthProvider>
  );
}
