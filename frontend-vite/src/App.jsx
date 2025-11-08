import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import InvoicesPage from './pages/dashboard/InvoicesPage'
import NewInvoicePage from './pages/dashboard/NewInvoicePage'
import SettingsPage from './pages/dashboard/SettingsPage'

import { Spinner } from '@/components/ui/spinner';

import PublicLayout from './components/layout/PublicLayout' // --- NEW ---
import LandingPage from './pages/public/LandingPage' // --- NEW ---

// A wrapper for protected routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

// A wrapper for public routes (like login/register)
// This prevents logged-in users from seeing the login page
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <Routes>
      {/* --- NEW Public Routes --- */}
      {/* These routes use the new PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/login"
          element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>}
        />
        <Route
          path="/register"
          element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>}
        />
      </Route>

      {/* --- Protected App Routes --- */}
      {/* These routes use the AppLayout (with sidebar) */}
      <Route
        path="/app" // All app routes are now prefixed with /app
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/new" element={<NewInvoicePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* --- Legacy Redirects --- */}
      {/* Redirect old /dashboard to /app/dashboard */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/invoices" element={<Navigate to="/app/invoices" replace />} />
      <Route path="/invoices/new" element={<Navigate to="/app/invoices/new" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />


      {/* 404 Not Found */}
      <Route path="*" element={
        <div className="flex h-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">404 - Not Found</h1>
          <p className="text-muted-foreground">This page does not exist.</p>
        </div>
      } />
    </Routes>
  );
}

export default App;