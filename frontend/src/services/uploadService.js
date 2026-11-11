/**
 * uploadService.js
 * Presigned S3 uploads and CSV statement import.
 *
 * Contract (Part 2 architecture):
 *   GET  /uploads/presigned-url?type=csv|receipt
 *   PUT  <presigned URL>
 *   POST /transactions/import  { s3ObjectKey }
 */
import apiClient from './api';

function unwrapBody(payload) {
  if (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object') {
    return payload.data;
  }
  return payload ?? {};
}

/**
 * Normalize the presigned-url response into the fields the UI needs.
 * Reads only keys named in the architecture or already used by this app.
 */
export function normalizePresignedResponse(payload) {
  const body = unwrapBody(payload);
  return {
    uploadUrl: body.uploadUrl ?? body.url ?? body.presignedUrl ?? null,
    s3ObjectKey: body.s3ObjectKey ?? body.fileKey ?? body.key ?? null,
    receiptUrl: body.receiptUrl ?? body.fileUrl ?? null,
  };
}

/**
 * Request a presigned S3 PUT URL.
 * @param {'csv'|'receipt'} type
 */
export async function fetchPresignedUrl(type) {
  const response = await apiClient.get('/uploads/presigned-url', {
    params: { type },
  });
  const normalized = normalizePresignedResponse(response.data);
  if (!normalized.uploadUrl) {
    throw new Error('Presigned URL response did not include an upload URL.');
  }
  return normalized;
}

/**
 * PUT a file directly to the S3 vault URL.
 * @param {string} url
 * @param {File} file
 */
export async function uploadToS3(url, file) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`S3 upload failed (${response.status}).`);
  }
}

/**
 * Ask the API to parse an uploaded statement.
 * @param {string} s3ObjectKey
 */
export async function importCSV(s3ObjectKey) {
  const response = await apiClient.post('/transactions/import', { s3ObjectKey });
  return response.data;
}

/**
 * Build the success toast from the import response when a count is present.
 * @param {unknown} payload
 */
export function importResultMessage(payload) {
  const body = unwrapBody(payload);
  const count = body.importedCount ?? body.count ?? body.imported ?? body.transactionCount;
  if (typeof count === 'number') {
    return `Successfully imported ${count} transactions`;
  }
  return 'Successfully imported transactions';
}
