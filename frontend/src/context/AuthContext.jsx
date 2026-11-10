/**
 * AuthContext.jsx
 * Provides user session state, JWT tokens, and auth actions app-wide.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);   // { email, sub }
  const [token, setToken]         = useState(null);   // id token (used as Bearer)
  const [isLoading, setIsLoading] = useState(true);  // session bootstrap

  // ── Bootstrap: restore session from Cognito on mount ─────────────────────
  useEffect(() => {
    authService.getCurrentSession()
      .then((session) => {
        if (session) {
          setUser({ email: session.email, sub: session.sub });
          setToken(session.idToken);
          localStorage.setItem('fintrack_id_token', session.idToken);
        }
      })
      .catch(() => { /* no-op — user is simply not logged in */ })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  // Accepts { username, password } — username can be the Cognito username or email
  const login = useCallback(async ({ username, password }) => {
    const session = await authService.login({ username, password });
    setUser({ email: session.email, sub: session.sub });
    setToken(session.idToken);
    localStorage.setItem('fintrack_id_token',     session.idToken);
    localStorage.setItem('fintrack_access_token', session.accessToken);
    localStorage.setItem('fintrack_user',         JSON.stringify({ email: session.email, sub: session.sub }));
    return session;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Convenience hook */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
