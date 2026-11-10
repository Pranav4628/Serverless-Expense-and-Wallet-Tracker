import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import * as authService from '../../services/authService';
import ErrorAlert from '../common/ErrorAlert';

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [step, setStep]         = useState('request'); // 'request' | 'reset'
  const [email, setEmail]       = useState('');
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setErrors({ email: 'Email is required.' }); return; }
    setIsLoading(true);
    setApiError('');
    try {
      await authService.forgotPassword(email.trim());
      setStep('reset');
    } catch (err) {
      setApiError(err.message ?? 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!code.trim())     errs.code     = 'Reset code is required.';
    if (!password)        errs.password = 'New password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    setApiError('');
    try {
      await authService.confirmForgotPassword({ email: email.trim(), code: code.trim(), newPassword: password });
      navigate('/login', { state: { passwordReset: true } });
    } catch (err) {
      setApiError(err.message ?? 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <BarChart2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Reset your password</h1>
        </div>

        <div className="card">
          <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />
          {apiError && <div className="mt-4" />}

          {step === 'request' ? (
            <form onSubmit={handleRequest} noValidate className="space-y-5">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                />
                {errors.email && <p className="mt-1.5 text-xs text-expense">{errors.email}</p>}
              </div>
              <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} noValidate className="space-y-5">
              <p className="text-sm text-neutral-500">
                Check <span className="font-medium text-neutral-700">{email}</span> for the reset code.
              </p>
              <div>
                <label htmlFor="reset-code" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Reset code
                </label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  className={`input ${errors.code ? 'input-error' : ''}`}
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setErrors((p) => ({ ...p, code: undefined })); }}
                />
                {errors.code && <p className="mt-1.5 text-xs text-expense">{errors.code}</p>}
              </div>
              <div>
                <label htmlFor="reset-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  New password
                </label>
                <input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                />
                {errors.password && <p className="mt-1.5 text-xs text-expense">{errors.password}</p>}
              </div>
              <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                {isLoading ? 'Resetting…' : 'Set new password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
