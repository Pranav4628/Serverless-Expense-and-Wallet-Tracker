import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ErrorAlert from '../common/ErrorAlert';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? '/dashboard';

  const [form, setForm]           = useState({ username: '', password: '' });
  const [errors, setErrors]       = useState({});
  const [apiError, setApiError]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required.';
    if (!form.password)        e.password = 'Password is required.';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    setApiError('');
    try {
      await login({ username: form.username.trim(), password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message ?? 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <BarChart2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Sign in to FinTrack</h1>
          <p className="text-sm text-neutral-500">Track your expenses, master your money.</p>
        </div>

        <div className="card">
          <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />
          {apiError && <div className="mt-4" />}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Username */}
            <div>
              <label htmlFor="login-username" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                className={`input ${errors.username ? 'input-error' : ''}`}
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange('username')}
                aria-describedby={errors.username ? 'login-username-error' : undefined}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p id="login-username-error" className="mt-1.5 text-xs text-expense">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-neutral-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-600 hover:underline focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange('password')}
                  aria-describedby={errors.password ? 'login-pass-error' : undefined}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="login-pass-error" className="mt-1.5 text-xs text-expense">{errors.password}</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
