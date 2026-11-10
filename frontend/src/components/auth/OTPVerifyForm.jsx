import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, Mail } from 'lucide-react';
import * as authService from '../../services/authService';
import ErrorAlert from '../common/ErrorAlert';

export default function OTPVerifyForm() {
  const navigate = useNavigate();
  const location = useLocation();
  // username is the Cognito username used at sign-up; email is shown for display
  const username = location.state?.username ?? '';
  const email    = location.state?.email    ?? '';

  const [code, setCode]           = useState('');
  const [codeError, setCodeError] = useState('');
  const [apiError, setApiError]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setCodeError('Verification code is required.'); return; }

    setIsLoading(true);
    setApiError('');
    try {
      await authService.confirmSignUp({ username: username || email, code: code.trim() });
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      setApiError(err.message ?? 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setResendMsg('A new code has been sent to your email (if this account exists).');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <BarChart2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Verify your email</h1>
          <p className="text-sm text-neutral-500 text-center">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-neutral-700">{email || 'your email'}</span>.
          </p>
        </div>

        <div className="card">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Mail className="h-8 w-8" />
            </div>
          </div>

          <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />
          {apiError && <div className="mt-4" />}

          {resendMsg && (
            <p className="mb-4 text-sm text-income-dark bg-income-light rounded-lg px-4 py-3">
              {resendMsg}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="otp-code" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Verification code
              </label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={`input tracking-widest text-center text-lg font-mono ${codeError ? 'input-error' : ''}`}
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  setCodeError('');
                }}
                aria-invalid={!!codeError}
              />
              {codeError && <p className="mt-1.5 text-xs text-expense">{codeError}</p>}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-neutral-500">
            <p>
              Did not receive a code?{' '}
              <button
                type="button"
                onClick={handleResend}
                className="font-medium text-primary-600 hover:underline focus:outline-none"
              >
                Resend
              </button>
            </p>
            <Link to="/login" className="text-neutral-400 hover:text-neutral-600 text-xs">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
