import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Auth pages
import LoginForm          from './components/auth/LoginForm';
import SignUpForm         from './components/auth/SignUpForm';
import OTPVerifyForm      from './components/auth/OTPVerifyForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';

// Protected pages
import DashboardPage    from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
          {/* ── Public routes ──────────────────────────────────── */}
          <Route path="/login"           element={<LoginForm />} />
          <Route path="/signup"          element={<SignUpForm />} />
          <Route path="/verify"          element={<OTPVerifyForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />

          {/* ── Protected routes ───────────────────────────────── */}
          {/*
            ProtectedRoute renders either a redirect or its children.
            MainLayout contains <Outlet/>, so child routes render inside it.
          */}
          <Route
            element={
              <ProtectedRoute>
                <TransactionProvider>
                  <MainLayout />
                </TransactionProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
          </Route>

          {/* ── Default redirects ──────────────────────────────── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
