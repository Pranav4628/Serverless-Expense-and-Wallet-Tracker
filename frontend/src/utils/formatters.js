/**
 * Format a numeric value as a USD currency string.
 * @param {number} amount
 * @param {boolean} [showSign=false] – prefix + for positive values
 * @returns {string}
 */
export function formatCurrency(amount, showSign = false) {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);

  if (!showSign) return formatted;
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

/**
 * Format an ISO date string or Date object to a short locale string.
 * @param {string|Date} dateInput
 * @returns {string}  e.g. "Oct 13, 2026"
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Return today's date as an ISO YYYY-MM-DD string (for default form values).
 */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Build start/end ISO date strings for common filter presets.
 * @param {'current_month'|'last_30'|'last_3_months'|'year_to_date'} preset
 * @returns {{ startDate: string, endDate: string }}
 */
export function getDateRange(preset) {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start;

  switch (preset) {
    case 'current_month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      start = first.toISOString().split('T')[0];
      break;
    }
    case 'last_30': {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0];
      break;
    }
    case 'last_3_months': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      start = d.toISOString().split('T')[0];
      break;
    }
    case 'year_to_date': {
      start = `${now.getFullYear()}-01-01`;
      break;
    }
    default:
      start = end;
  }

  return { startDate: start, endDate: end };
}

/** Expense categories available in the app */
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Housing & Rent',
  'Utilities',
  'Transportation',
  'Health & Medical',
  'Entertainment',
  'Shopping',
  'Education',
  'Travel',
  'Personal Care',
  'Subscriptions',
  'Other',
];

/** Income categories available in the app */
export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other',
];

/** All categories (deprecated - use EXPENSE_CATEGORIES or INCOME_CATEGORIES instead) */
export const CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

/** Transaction types */
export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'];
