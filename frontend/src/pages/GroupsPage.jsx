import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ChevronRight } from 'lucide-react';
import { getGroups } from '../services/groupService';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import ErrorAlert from '../components/common/ErrorAlert';
import SkeletonCard from '../components/common/SkeletonCard';
import Toast from '../components/common/Toast';

function GroupCard({ group, onClick }) {
  // Backend GET /groups returns memberCount directly — use it first.
  // Fall back to members array length only if memberCount is absent.
  const memberCount = group.memberCount ?? group.members?.length ?? 0;
  const netBalance = group.netBalance ?? 0;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className="card card-hover w-full text-left transition-all duration-200 group animate-slide-up"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 transition-transform duration-200 group-hover:scale-110">
            <Users className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1 truncate">
              {group.groupName}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Net Balance</p>
            <p className={`text-lg font-bold tabular-nums ${
              netBalance >= 0 
                ? 'text-income dark:text-income' 
                : 'text-expense dark:text-expense'
            }`}>
              ₹{Math.abs(netBalance).toFixed(2)}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-neutral-400 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getGroups();
      console.log('📋 Groups List API Response:', response);
      // Handle various response formats
      const groupData = response.groups ?? response.data?.groups ?? response.items ?? response;
      console.log('📋 Parsed groups array:', groupData);
      setGroups(Array.isArray(groupData) ? groupData : []);
    } catch (err) {
      // Check if this is a "not implemented" error
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message ?? err.message ?? '';
      
      if (status === 404 || status === 403 || errorMsg.includes('Authorization header')) {
        setError(
          'Groups API endpoint is not yet configured in the backend. ' +
          'Please ensure the GroupHandler Lambda is deployed and the /groups endpoint ' +
          'is set up in API Gateway with Cognito authorization.'
        );
      } else {
        setError(errorMsg || 'Failed to load groups.');
      }
      
      console.error('Groups API error:', {
        status,
        message: errorMsg,
        fullError: err,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleGroupCreated = () => {
    setModalOpen(false);
    setToast('Group created successfully!');
    fetchGroups();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="heading-1">Group Wallets</h1>
          <p className="text-sm text-muted mt-1">
            Shared household ledgers and expense tracking
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span>New Group</span>
        </button>
      </div>

      {/* Error */}
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && groups.length === 0 && (
        <div className="card animate-fade-in py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4 mx-auto">
            <Users className="w-8 h-8 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
            No groups yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Create a group to start tracking shared expenses with roommates, family, or friends.
          </p>
          <button
            type="button"
            className="btn btn-primary gap-2 mx-auto"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Create Your First Group
          </button>
        </div>
      )}

      {/* Groups grid */}
      {!isLoading && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {groups.map((group, idx) => (
            <div key={group.groupId ?? group.id ?? idx} style={{ animationDelay: `${idx * 50}ms` }}>
              <GroupCard
                group={group}
                onClick={() => handleGroupClick(group.groupId ?? group.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create group modal */}
      <CreateGroupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleGroupCreated}
      />

      {/* Toast */}
      <Toast message={toast} onDismiss={() => setToast('')} />
    </div>
  );
}
