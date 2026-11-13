import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Users } from 'lucide-react';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: List },
  { to: '/groups',       label: 'Groups',       icon: Users },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 sm:hidden transition-colors duration-200"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 dark:focus-visible:ring-primary-500',
                  isActive
                    ? 'text-primary-600 dark:text-primary-500'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span className={isActive ? 'font-semibold' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
