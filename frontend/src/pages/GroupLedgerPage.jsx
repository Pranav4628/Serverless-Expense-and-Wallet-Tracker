import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, UserPlus, Users, Trash2 } from 'lucide-react';
import {
  getGroup,
  getGroupTransactions,
  getGroupSettlements,
  deleteGroup,
} from '../services/groupService';
import { useAuth } from '../context/AuthContext';
import GroupTransactionList from '../components/groups/GroupTransactionList';
import GroupTransactionModal from '../components/groups/GroupTransactionModal';
import AddMemberModal from '../components/groups/AddMemberModal';
import SettlementsTab from '../components/groups/SettlementsTab';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorAlert from '../components/common/ErrorAlert';
import SkeletonCard from '../components/common/SkeletonCard';
import Toast from '../components/common/Toast';

export default function GroupLedgerPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab]                   = useState('ledger');
  const [group, setGroup]                           = useState(null);
  const [transactions, setTransactions]             = useState([]);
  const [debts, setDebts]                           = useState([]);
  const [currentUserQrUrl, setCurrentUserQrUrl]     = useState(null);
  const [isLoading, setIsLoading]                   = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingSettlements, setIsLoadingSettlements]   = useState(false);
  const [isDeletingGroup, setIsDeletingGroup]       = useState(false);
  const [error, setError]                           = useState('');
  const [toast, setToast]                           = useState('');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen]       = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen]       = useState(false);
  const [editTarget, setEditTarget]                 = useState(null);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchTransactions();
    }
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'settlements' && groupId) {
      fetchSettlements();
    }
  }, [activeTab, groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Data fetchers ────────────────────────────────────────────────────────────

  const fetchGroup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response  = await getGroup(groupId);
      const groupData = response.group ?? response.data?.group ?? response;

      // Filter out any invalid member entries the backend may have returned
      if (groupData && Array.isArray(groupData.members)) {
        groupData.members = groupData.members.filter(
          (m) => m && m.userId && m.userId !== 'undefined',
        );
      }

      // Pre-populate the current user's QR URL from their membership record
      if (groupData?.members && user?.sub) {
        const me = groupData.members.find((m) => m.userId === user.sub);
        if (me?.upiQrUrl) setCurrentUserQrUrl(me.upiQrUrl);
      }

      setGroup(groupData);
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to load group details.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const response = await getGroupTransactions(groupId);
      const txData = response.transactions ?? response.data?.transactions ?? response.items ?? response;
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      console.error('Failed to load group transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchSettlements = async () => {
    setIsLoadingSettlements(true);
    try {
      const response = await getGroupSettlements(groupId);
      // Backend returns { debts: [{ from, to, amount }] }
      const debtData = response.debts ?? response.data?.debts ?? [];
      setDebts(Array.isArray(debtData) ? debtData : []);
    } catch (err) {
      console.error('Failed to load settlements:', err);
      setDebts([]);
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  // ── Action handlers ──────────────────────────────────────────────────────────

  const handleTransactionSaved = () => {
    setTransactionModalOpen(false);
    setEditTarget(null);
    setToast(editTarget ? 'Transaction updated!' : 'Transaction added!');
    fetchTransactions();
    // Keep settlements in sync whenever the ledger changes
    if (activeTab === 'settlements') fetchSettlements();
  };

  const handleTransactionDeleted = (txId) => {
    // Optimistic removal — no spinner needed
    setTransactions((prev) => prev.filter(
      (t) => (t.transactionId ?? t.id) !== txId,
    ));
    setToast('Transaction deleted.');
    // Refresh settlements in background so debts stay accurate
    fetchSettlements();
  };

  const handleMemberAdded = () => {
    setMemberModalOpen(false);
    setToast('Member added successfully!');
    fetchGroup();
  };

  const handleQrUploaded = (newUrl) => {
    setCurrentUserQrUrl(newUrl);
    setToast('UPI QR code saved successfully!');
  };

  const handleDeleteGroup = async () => {
    setIsDeletingGroup(true);
    try {
      await deleteGroup(groupId);
      navigate('/groups', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to delete group.');
      setIsDeletingGroup(false);
    }
  };

  const handleOpenEdit = (tx) => {
    setEditTarget(tx);
    setTransactionModalOpen(true);
  };

  // ── Render guards ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <SkeletonCard lines={5} />
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
        <button type="button" className="btn btn-ghost gap-2" onClick={() => navigate('/groups')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Groups
        </button>
        <ErrorAlert message={error} />
      </div>
    );
  }

  const members     = group?.members ?? [];
  const memberCount = group?.memberCount ?? members.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="btn btn-ghost p-2 shrink-0"
            onClick={() => navigate('/groups')}
            aria-label="Back to groups"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="heading-1">{group?.groupName ?? 'Group Ledger'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Users className="h-4 w-4 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
              <p className="text-sm text-muted">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Delete Group — red icon button */}
          <button
            type="button"
            className="btn btn-secondary gap-2 text-expense hover:bg-expense-light hover:border-expense dark:hover:bg-expense-dark/20"
            onClick={() => setDeleteGroupOpen(true)}
            disabled={isDeletingGroup}
            aria-label="Delete group"
            title="Delete group"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Delete Group</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary gap-2"
            onClick={() => setMemberModalOpen(true)}
          >
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            <span>Add Member</span>
          </button>

          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={() => { setEditTarget(null); setTransactionModalOpen(true); }}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Inline error (after group loads) */}
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* ── Tabs ── */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-neutral-200 dark:border-neutral-700">
          {['ledger', 'settlements'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors duration-150 ${
                activeTab === tab
                  ? 'text-primary-600 dark:text-primary-500 border-b-2 border-primary-600 dark:border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'ledger' && (
            <GroupTransactionList
              transactions={transactions}
              isLoading={isLoadingTransactions}
              members={members}
              groupId={groupId}
              onEdit={handleOpenEdit}
              onDeleted={handleTransactionDeleted}
            />
          )}
          {activeTab === 'settlements' && (
            <SettlementsTab
              debts={debts}
              isLoading={isLoadingSettlements}
              currentUserEmail={user?.email}
              groupId={groupId}
              currentUserQrUrl={currentUserQrUrl}
              onQrUploaded={handleQrUploaded}
            />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <GroupTransactionModal
        isOpen={transactionModalOpen}
        onClose={() => { setTransactionModalOpen(false); setEditTarget(null); }}
        onSuccess={handleTransactionSaved}
        groupId={groupId}
        members={members}
        transaction={editTarget}
      />

      <AddMemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onSuccess={handleMemberAdded}
        groupId={groupId}
        existingMembers={members}
      />

      <ConfirmDialog
        isOpen={deleteGroupOpen}
        onClose={() => setDeleteGroupOpen(false)}
        onConfirm={handleDeleteGroup}
        title={`Delete "${group?.groupName}"?`}
        message="All transactions and member data for this group will be permanently deleted. This cannot be undone."
        confirmLabel="Delete Group"
        variant="danger"
      />

      <Toast message={toast} onDismiss={() => setToast('')} />
    </div>
  );
}
