/**
 * transactionService.js
 * All transaction and analytics API calls.
 */
import apiClient from './api';

// ─── Transactions CRUD ───────────────────────────────────────────────────────

/**
 * Fetch paginated transactions.
 * @param {{ page?: number, limit?: number, category?: string, type?: string, startDate?: string, endDate?: string }} params
 */
export async function getTransactions(params = {}) {
  const response = await apiClient.get('/transactions', { params });
  return response.data;
}

/**
 * Fetch a single transaction by ID.
 * @param {string} id
 */
export async function getTransaction(id) {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
}

/**
 * Create a new transaction.
 * @param {{ amount: number, type: 'INCOME'|'EXPENSE', category: string, description?: string, date: string, receiptUrl?: string }} payload
 */
export async function createTransaction(payload) {
  const response = await apiClient.post('/transactions', payload);
  return response.data;
}

/**
 * Update an existing transaction.
 * @param {string} id
 * @param {Partial<{ amount: number, type: string, category: string, description: string, date: string, receiptUrl: string }>} payload
 */
export async function updateTransaction(id, payload) {
  const response = await apiClient.put(`/transactions/${id}`, payload);
  return response.data;
}

/**
 * Delete a transaction.
 * @param {string} id
 */
export async function deleteTransaction(id) {
  const response = await apiClient.delete(`/transactions/${id}`);
  return response.data;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

/**
 * Fetch the summary (income, expenses, balance) for a date range.
 * @param {{ startDate?: string, endDate?: string }} params
 */
export async function getAnalyticsSummary(params = {}) {
  const response = await apiClient.get('/analytics/summary', { params });
  return response.data;
}

/**
 * Fetch category-level breakdown for a date range.
 * @param {{ startDate?: string, endDate?: string }} params
 */
export async function getAnalyticsCategories(params = {}) {
  const response = await apiClient.get('/analytics/categories', { params });
  return response.data;
}

// ─── Receipt Upload ───────────────────────────────────────────────────────────

/**
 * Request a presigned S3 URL for uploading a receipt.
 * @param {{ fileName: string, fileType: string }} params
 * @returns {Promise<{ uploadUrl: string, fileKey: string }>}
 */
export async function getReceiptUploadUrl({ fileName, fileType }) {
  const response = await apiClient.post('/receipts/presigned-url', {
    fileName,
    fileType,
  });
  return response.data;
}

/**
 * Upload a file directly to S3 using a presigned URL.
 * @param {string} uploadUrl
 * @param {File} file
 */
export async function uploadReceiptToS3(uploadUrl, file) {
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
}
