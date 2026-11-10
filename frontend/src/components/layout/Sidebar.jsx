import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, BarChart2, X, Menu } from 'lucide-react';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: List },
];

export default function Sidebar({ isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed top-0 left-0 z-40 h-full bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700',
          'flex flex-col transition-all duration-300 ease-in-out',
          'lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-16' : 'lg:w-64 w-64',
        ].join(' ')}
        aria-label="Main navigation"
      >
        {/* Mobile close button + logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100 dark:border-neutral-700 lg:hidden">
          <div className="flex items-center gap-2 font-bold text-primary-600 dark:text-primary-500">
            <BarChart2 className="h-5 w-5" />
            <span>FinTrack</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 transition-colors duration-150"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop header with toggle */}
        <div className="hidden lg:flex items-center justify-between px-4 py-4 border-b border-neutral-100 dark:border-neutral-700">
          {!isCollapsed && (
            <div className="flex items-center gap-2 font-bold text-primary-600 dark:text-primary-500">
              <BarChart2 className="h-5 w-5" />
              <span>FinTrack</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 transition-colors duration-150"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              title={isCollapsed ? label : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  isCollapsed ? 'justify-center' : '',
                ].join(' ')
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
