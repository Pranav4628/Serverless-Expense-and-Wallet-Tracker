import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, UserPlus, Users } from 'lucide-react';
import { getGroup, getGroupTransactions, getGroupSettlements } from '../services/groupService';
import GroupTransactionList from '../components/groups/GroupTransactionList';
import GroupTransactionModal from '../components/groups/GroupTransactionModal';
import AddMemberModal from '../components/groups/AddMemberModal';
import SettlementsTab from '../components/groups/SettlementsTab';
import ErrorAlert from '../components/common/ErrorAlert';
import SkeletonCard from '../components/common/SkeletonCard';
import Toast from '../components/common/Toast';

export default function GroupLedgerPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'settlements'
  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchTransactions();
    }
  }, [groupId]);

  useEffect(() => {
    if (activeTab === 'settlements' && groupId) {
      fetchSettlements();
    }
  }, [activeTab, groupId]);

  const fetchGroup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getGroup(groupId);
      const groupData = response.group ?? response.data?.group ?? response;
      console.log('🔍 Group API Response:', { response, groupData });
      console.log('👥 Members:', groupData?.members);
      console.log('📊 Member count:', groupData?.memberCount);
      
      // Filter out invalid members (userId or name === 'undefined' or falsy)
      // This is a workaround for backend data quality issues.
      if (groupData && Array.isArray(groupData.members)) {
        groupData.members = groupData.members.filter((m) => {
          if (!m || !m.userId) return false;
          if (m.userId === 'undefined' || m.name === 'undefined') return false;
          return true;
        });
        console.log('👥 Members filtered:', groupData.members);
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
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchSettlements = async () => {
    setIsLoadingSettlements(true);
    try {
      const response = await getGroupSettlements(groupId);
      const settlementData = response.settlements ?? response.data?.settlements ?? response.debts ?? response;
      setSettlements(Array.isArray(settlementData) ? settlementData : []);
    } catch (err) {
      console.error('Failed to load settlements:', err);
      setSettlements([]);
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  const handleTransactionAdded = () => {
    setTransactionModalOpen(false);
    setEditTarget(null);
    setToast('Transaction added successfully!');
    fetchTransactions();
    if (activeTab === 'settlements') {
      fetchSettlements();
    }
  };

  const handleMemberAdded = () => {
    setMemberModalOpen(false);
    setToast('Member added successfully!');
    // Re-fetch group details so memberCount in the header updates immediately
    // without requiring a page refresh.
    fetchGroup();
  };

  const handleOpenEdit = (tx) => {
    setEditTarget(tx);
    setTransactionModalOpen(true);
  };

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
        <button
          type="button"
          className="btn btn-ghost gap-2"
          onClick={() => navigate('/groups')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Groups
        </button>
        <ErrorAlert message={error} />
      </div>
    );
  }

  const members = group?.members ?? [];
  // Prefer the memberCount field returned by the API over deriving it from
  // the local members array, which may not always be fully populated.
  const memberCount = group?.memberCount ?? members.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
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
            onClick={() => {
              setEditTarget(null);
              setTransactionModalOpen(true);
            }}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-150 ${
              activeTab === 'ledger'
                ? 'text-primary-600 dark:text-primary-500 border-b-2 border-primary-600 dark:border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settlements')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-150 ${
              activeTab === 'settlements'
                ? 'text-primary-600 dark:text-primary-500 border-b-2 border-primary-600 dark:border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            Settlements
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'ledger' && (
            <GroupTransactionList
              transactions={transactions}
              isLoading={isLoadingTransactions}
              members={members}
              onEdit={handleOpenEdit}
              onRefresh={fetchTransactions}
            />
          )}
          {activeTab === 'settlements' && (
            <SettlementsTab
              settlements={settlements}
              isLoading={isLoadingSettlements}
              members={members}
              groupId={groupId}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <GroupTransactionModal
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditTarget(null);
        }}
        onSuccess={handleTransactionAdded}
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

      {/* Toast */}
      <Toast message={toast} onDismiss={() => setToast('')} />
    </div>
  );
}
