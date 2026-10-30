import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { InitiativesPage } from './pages/InitiativesPage';
import { NewInitiativePage } from './pages/NewInitiativePage';
import { InitiativeDetailPage } from './pages/InitiativeDetailPage';
import { WorkflowBoardPage } from './pages/WorkflowBoardPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { AuditLogPage } from './pages/AuditLogPage';
import { Sparkles } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 space-y-3">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400">Verifying enterprise session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 space-y-3">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Enterprise Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="initiatives" element={<InitiativesPage />} />
            <Route path="initiatives/new" element={<NewInitiativePage />} />
            <Route path="initiatives/:id" element={<InitiativeDetailPage />} />
            <Route path="workflows" element={<WorkflowBoardPage />} />
            <Route path="intelligence" element={<IntelligencePage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

