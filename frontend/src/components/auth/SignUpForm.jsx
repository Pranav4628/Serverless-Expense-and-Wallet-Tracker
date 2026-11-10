import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BarChart2 } from 'lucide-react';
import * as authService from '../../services/authService';
import ErrorAlert from '../common/ErrorAlert';

export default function SignUpForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    name: '',
    preferredUsername: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim())         e.username         = 'Username is required.';
    if (!form.email.trim())            e.email            = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Enter a valid email.';
    if (!form.name.trim())             e.name             = 'Name is required.';
    if (!form.phoneNumber.trim())      e.phoneNumber      = 'Phone number is required.';
    else if (!/^\+?[1-9]\d{1,14}$/.test(form.phoneNumber.replace(/[\s-]/g, ''))) 
      e.phoneNumber = 'Enter a valid phone number with country code (e.g., +911234567890)';
    if (!form.gender)                  e.gender           = 'Gender is required.';
    if (!form.password)                e.password         = 'Password is required.';
    else if (form.password.length < 8) e.password         = 'Password must be at least 8 characters.';
    if (!form.confirm)                 e.confirm          = 'Please confirm your password.';
    else if (form.confirm !== form.password) e.confirm    = 'Passwords do not match.';
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
      await authService.signUp({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        preferredUsername: form.preferredUsername.trim() || form.username.trim(),
        phoneNumber: form.phoneNumber.trim(),
        gender: form.gender,
      });
      navigate('/verify', { state: { username: form.username.trim(), email: form.email.trim() } });
    } catch (err) {
      setApiError(err.message ?? 'Sign-up failed. Please try again.');
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
          <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
          <p className="text-sm text-neutral-500">Start tracking your finances today.</p>
        </div>

        <div className="card">
          <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />
          {apiError && <div className="mt-4" />}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="signup-username" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Username <span className="text-expense">*</span>
              </label>
              <input
                id="signup-username"
                type="text"
                autoComplete="username"
                className={`input ${errors.username ? 'input-error' : ''}`}
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange('username')}
                aria-invalid={!!errors.username}
              />
              {errors.username && <p className="mt-1.5 text-xs text-expense">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email address <span className="text-expense">*</span>
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-1.5 text-xs text-expense">{errors.email}</p>}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Full Name <span className="text-expense">*</span>
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="mt-1.5 text-xs text-expense">{errors.name}</p>}
            </div>

            {/* Preferred Username (optional) */}
            <div>
              <label htmlFor="signup-preferred" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Preferred Username <span className="text-neutral-400 text-xs">(optional)</span>
              </label>
              <input
                id="signup-preferred"
                type="text"
                className="input"
                placeholder="Display name"
                value={form.preferredUsername}
                onChange={handleChange('preferredUsername')}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="signup-phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Phone Number <span className="text-expense">*</span>
              </label>
              <input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                className={`input ${errors.phoneNumber ? 'input-error' : ''}`}
                placeholder="+911234567890"
                value={form.phoneNumber}
                onChange={handleChange('phoneNumber')}
                aria-invalid={!!errors.phoneNumber}
              />
              {errors.phoneNumber && <p className="mt-1.5 text-xs text-expense">{errors.phoneNumber}</p>}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="signup-gender" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Gender <span className="text-expense">*</span>
              </label>
              <select
                id="signup-gender"
                className={`input ${errors.gender ? 'input-error' : ''}`}
                value={form.gender}
                onChange={handleChange('gender')}
                aria-invalid={!!errors.gender}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && <p className="mt-1.5 text-xs text-expense">{errors.gender}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Password <span className="text-expense">*</span>
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange('password')}
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
              {errors.password && <p className="mt-1.5 text-xs text-expense">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Confirm password <span className="text-expense">*</span>
              </label>
              <input
                id="signup-confirm"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                className={`input ${errors.confirm ? 'input-error' : ''}`}
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={handleChange('confirm')}
                aria-invalid={!!errors.confirm}
              />
              {errors.confirm && <p className="mt-1.5 text-xs text-expense">{errors.confirm}</p>}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

