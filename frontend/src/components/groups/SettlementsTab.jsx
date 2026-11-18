import { formatCurrency } from '../../utils/formatters';
import UPILinkButton from './UPILinkButton';
import UPIQrUploader from './UPIQrUploader';
import SkeletonCard from '../common/SkeletonCard';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * Renders one debt row.
 * debt: { from: "jane@email.com", to: "john@email.com", amount: 400, upiQrUrl?: string }
 * `from` owes `to`.
 */
function DebtRow({ debt, currentUserEmail, idx }) {
  const isCurrentUserDebtor   = debt.from === currentUserEmail;
  const isCurrentUserCreditor = debt.to   === currentUserEmail;

  return (
    <div
      className="card animate-slide-up flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      {/* Who owes whom */}
      <div className="flex items-center gap-2 min-w-0 flex-1 text-sm">
        <span className={`font-semibold truncate ${
          isCurrentUserDebtor
            ? 'text-expense dark:text-expense'
            : 'text-neutral-800 dark:text-neutral-200'
        }`}>
          {debt.from}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
        <span className={`font-semibold truncate ${
          isCurrentUserCreditor
            ? 'text-income dark:text-income'
            : 'text-neutral-800 dark:text-neutral-200'
        }`}>
          {debt.to}
        </span>
      </div>

      {/* Amount + Settle Up */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className={`text-lg font-bold tabular-nums ${
            isCurrentUserDebtor ? 'text-expense' : 'text-income'
          }`}>
            {formatCurrency(debt.amount)}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isCurrentUserDebtor ? 'You owe' : 'Owed to you'}
          </p>
        </div>

        {/* Show Settle Up only when current user is the debtor */}
        {isCurrentUserDebtor && (
          <UPILinkButton
            upiQrUrl={debt.upiQrUrl ?? null}
            name={debt.to}
            amount={debt.amount}
            label="Settle Up"
          />
        )}
      </div>
    </div>
  );
}

/**
 * SettlementsTab
 *
 * Props:
 *   debts            — [{ from, to, amount, upiQrUrl? }]
 *   isLoading        — boolean
 *   currentUserEmail — logged-in user's email (from AuthContext)
 *   groupId          — needed by UPIQrUploader to call POST /groups/{id}/qr
 *   currentUserQrUrl — the logged-in user's existing QR URL (if already uploaded)
 *   onQrUploaded     — callback(newUrl) so parent can persist the new URL in state
 */
export default function SettlementsTab({
  debts = [],
  isLoading,
  currentUserEmail,
  groupId,
  currentUserQrUrl,
  onQrUploaded,
}) {
  if (isLoading) return <SkeletonCard lines={4} />;

  return (
    <div className="space-y-6">

      {/* ── My QR Code upload section ─────────────────────────────────────── */}
      <div className="card bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
          Your Payment QR Code
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Upload your UPI QR code once so other members can scan and pay you back.
        </p>
        <UPIQrUploader
          groupId={groupId}
          currentQrUrl={currentUserQrUrl}
          onUploaded={onQrUploaded}
        />
      </div>

      {/* ── Debts list ────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
          Outstanding Debts
        </h3>

        {debts.length === 0 ? (
          <div className="py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-income-light dark:bg-income-dark/20 mb-4 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-income" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              All settled up!
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              No outstanding debts in this group.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {debts.map((debt, idx) => (
              <DebtRow
                key={idx}
                debt={debt}
                currentUserEmail={currentUserEmail}
                idx={idx}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
