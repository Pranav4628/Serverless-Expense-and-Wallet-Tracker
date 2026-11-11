# FinTrack Frontend: Implementation Plan

## Phase 1: File Handling (Modules 1 & 2)

**Goal:** Implement S3 Vault interactions for CSVs and Receipts.

1. Build the `api.js` utilities for requesting Presigned URLs and uploading direct to S3.
2. Construct the `FileUploadZone` component.
3. Integrate the uploader into the Transactions page for CSV imports.
4. Update the Transaction Form to accept receipt images and the tax-deductible toggle.

## Phase 2: Multi-Tenant Architecture (Modules 3 & 6)

**Goal:** Build the Group Wallets and UPI settlement interfaces.

1. Create the Groups index page (list all user groups).
2. Build the Group Creation and Member Invite modals.
3. Construct the specific Group Ledger view (routing to `/groups/:id`).
4. Implement the Settlements tab, parsing the debt calculation data into the `UPIActionBtn` components.

## Phase 3: Analytical Forecasting (Module 5)

**Goal:** Integrate predictive data into the Dashboard.

1. Update dashboard API calls to include `/analytics/forecast`.
2. Build the `ForecastWidget` to display recurring subscriptions.
3. Update the primary balance card to cleanly differentiate between "Current Net Balance" and "Safe to Spend".

## Phase 4: End-to-End Testing

**Goal:** Verify all flows in the browser.

1. Test CSV upload flow.
2. Test Receipt image attachment and retrieval.
3. Test Group creation, transaction logging, and UPI link generation on a mobile viewport.