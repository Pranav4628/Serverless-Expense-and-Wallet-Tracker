import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import UPILinkButton from './UPILinkButton';
import SkeletonCard from '../common/SkeletonCard';
import { ArrowRight } from 'lucide-react';

function SettlementCard({ settlement, currentUserId, members }) {
  const fromMember = members.find(m => (m.userId ?? m.id) === settlement.from);
  const toMember = members.find(m => (m.userId ?? m.id) === settlement.to);

  const fromName = fromMember?.name ?? fromMember?.email ?? 'Unknown';
  const toName = toMember?.name ?? toMember?.email ?? 'Unknown';
  const toUPI = toMember?.upiId ?? toMember?.upi ?? null;

  const isCurrentUserOwed = settlement.from === currentUserId;
  const amount = settlement.amount ?? 0;

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold truncate">{fromName}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
            <span className="font-semibold truncate">{toName}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-lg font-bold tabular-nums ${
              isCurrentUserOwed ? 'text-income' : 'text-expense'
            }`}>
              {formatCurrency(amount)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isCurrentUserOwed ? 'You are owed' : 'You owe'}
            </p>
          </div>

          {!isCurrentUserOwed && toUPI && (
            <UPILinkButton
              upiId={toUPI}
              name={toName}
              amount={amount}
              label="Settle Up"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettlementsTab({ settlements = [], isLoading, members = [], groupId }) {
  const { user } = useAuth();
  const currentUserId = user?.sub;

  if (isLoading) return <SkeletonCard lines={4} />;

  if (!settlements.length) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4 mx-auto">
          <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          All settled up!
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          No outstanding debts in this group.
        </p>
      </div>
    );
  }

  // Filter settlements involving current user
  const userSettlements = settlements.filter(
    s => s.from === currentUserId || s.to === currentUserId
  );

  if (userSettlements.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          You have no outstanding debts in this group.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
          Your Settlements
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Outstanding debts involving you
        </p>
      </div>

      {userSettlements.map((settlement, idx) => (
        <div key={idx} style={{ animationDelay: `${idx * 50}ms` }}>
          <SettlementCard
            settlement={settlement}
            currentUserId={currentUserId}
            members={members}
          />
        </div>
      ))}

      {settlements.length > userSettlements.length && (
        <>
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 mt-6">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
              Other Settlements
            </h3>
          </div>

          {settlements
            .filter(s => s.from !== currentUserId && s.to !== currentUserId)
            .map((settlement, idx) => (
              <div key={idx} style={{ animationDelay: `${(idx + userSettlements.length) * 50}ms` }}>
                <SettlementCard
                  settlement={settlement}
                  currentUserId={currentUserId}
                  members={members}
                />
              </div>
            ))}
        </>
      )}
    </div>
  );
}
