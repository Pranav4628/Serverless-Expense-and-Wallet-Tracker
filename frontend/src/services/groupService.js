/**
 * groupService.js
 * API calls for shared household ledgers (Group Wallets).
 * 
 * NOTE: If the backend is not fully configured with /groups endpoints,
 * these calls will fail. Ensure API Gateway has the GroupHandler Lambda
 * attached to the /groups routes with Cognito authorizer enabled.
 */
import apiClient from './api';

// ─── Groups CRUD ─────────────────────────────────────────────────────────────

/**
 * Fetch all groups the current user belongs to.
 * @returns {Promise<Array>}
 */
export async function getGroups() {
  try {
    const response = await apiClient.get('/groups');
    return response.data;
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('getGroups failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

/**
 * Fetch a single group by ID.
 * @param {string} groupId
 * @returns {Promise<Object>}
 */
export async function getGroup(groupId) {
  const response = await apiClient.get(`/groups/${groupId}`);
  return response.data;
}

/**
 * Create a new group.
 * @param {{ groupName: string }} payload
 * @returns {Promise<Object>}
 */
export async function createGroup(payload) {
  const response = await apiClient.post('/groups', payload);
  return response.data;
}

/**
 * Update group details.
 * @param {string} groupId
 * @param {{ groupName?: string }} payload
 * @returns {Promise<Object>}
 */
export async function updateGroup(groupId, payload) {
  const response = await apiClient.put(`/groups/${groupId}`, payload);
  return response.data;
}

/**
 * Delete a group.
 * @param {string} groupId
 * @returns {Promise<Object>}
 */
export async function deleteGroup(groupId) {
  const response = await apiClient.delete(`/groups/${groupId}`);
  return response.data;
}

// ─── Group Members ───────────────────────────────────────────────────────────

/**
 * Invite a member to a group.
 * @param {string} groupId
 * @param {{ email?: string, userId?: string }} payload
 * @returns {Promise<Object>}
 */
export async function addGroupMember(groupId, payload) {
  const response = await apiClient.post(`/groups/${groupId}/members`, payload);
  return response.data;
}

/**
 * Remove a member from a group.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function removeGroupMember(groupId, userId) {
  const response = await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
}

// ─── Group Transactions ──────────────────────────────────────────────────────

/**
 * Fetch transactions for a specific group.
 * @param {string} groupId
 * @param {{ page?: number, limit?: number, startDate?: string, endDate?: string }} params
 * @returns {Promise<Object>}
 */
export async function getGroupTransactions(groupId, params = {}) {
  const response = await apiClient.get(`/groups/${groupId}/transactions`, { params });
  return response.data;
}

/**
 * Create a transaction in a group ledger.
 * @param {string} groupId
 * @param {{ amount: number, type: string, category: string, description?: string, date: string, paidBy: string }} payload
 * @returns {Promise<Object>}
 */
export async function createGroupTransaction(groupId, payload) {
  const response = await apiClient.post(`/groups/${groupId}/transactions`, payload);
  return response.data;
}

/**
 * Update a group transaction.
 * @param {string} groupId
 * @param {string} transactionId
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function updateGroupTransaction(groupId, transactionId, payload) {
  const response = await apiClient.put(`/groups/${groupId}/transactions/${transactionId}`, payload);
  return response.data;
}

/**
 * Delete a group transaction.
 * @param {string} groupId
 * @param {string} transactionId
 * @returns {Promise<Object>}
 */
export async function deleteGroupTransaction(groupId, transactionId) {
  const response = await apiClient.delete(`/groups/${groupId}/transactions/${transactionId}`);
  return response.data;
}

// ─── Settlements ─────────────────────────────────────────────────────────────

/**
 * Get peer-to-peer debt calculations for a group.
 * @param {string} groupId
 * @returns {Promise<Array>} Array of settlement objects
 */
export async function getGroupSettlements(groupId) {
  const response = await apiClient.get(`/groups/${groupId}/settlements`);
  return response.data;
}
