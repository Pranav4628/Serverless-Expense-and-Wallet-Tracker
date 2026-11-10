import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, BarChart2, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ onMenuToggle, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 px-4 lg:px-6 transition-colors duration-200">
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        className="lg:hidden rounded-lg p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 transition-colors duration-150"
        onClick={onMenuToggle}
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isSidebarOpen}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Logo */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 font-bold text-lg text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 rounded transition-colors duration-150"
      >
        <BarChart2 className="h-6 w-6" aria-hidden="true" />
        <span>FinTrack</span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-lg p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 transition-all duration-150"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 transition-colors duration-150"
          aria-label="User menu"
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 font-semibold text-sm uppercase">
            {user?.email?.[0] ?? <User className="h-4 w-4" />}
          </span>
          <span className="hidden sm:block max-w-[160px] truncate">{user?.email}</span>
        </button>

        {userMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setUserMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-card border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-modal py-1 animate-scale-in">
              <div className="px-4 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-700 truncate">
                {user?.email}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:bg-neutral-50 dark:focus:bg-neutral-700 transition-colors duration-150"
              >
                <LogOut className="h-4 w-4 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
