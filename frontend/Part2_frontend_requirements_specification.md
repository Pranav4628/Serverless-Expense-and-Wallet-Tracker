# FinTrack Frontend: Part 2 Requirements (Advanced Modules)

## 1. Scope
This document outlines the functional and non-functional requirements for the frontend implementation of FinTrack's advanced modules: Statement Importer (Mod 1), Receipt Vault (Mod 2), Shared Ledgers (Mod 3), Subscription Radar (Mod 5), and UPI Settlements (Mod 6).

## 2. Functional Requirements (FRs)

### Module 1: Universal Bank Statement Importer
*   **FR-1.1:** The UI shall provide a drag-and-drop zone for users to upload `.csv` files (max 5MB).
*   **FR-1.2:** The UI shall display a loading skeleton while fetching the S3 Presigned URL and uploading the file.
*   **FR-1.3:** Upon successful import via API, the UI shall display a summary toast (e.g., "Successfully imported 45 transactions").

### Module 2: S3 Receipt Vault & Tax Audit
*   **FR-2.1:** The `TransactionForm` component shall include a file input for image uploads (receipts/invoices).
*   **FR-2.2:** The `TransactionForm` shall include a toggle switch labeled "Mark as Tax Deductible".
*   **FR-2.3:** The `TransactionList` shall display a paperclip icon or thumbnail for transactions containing a `receiptUrl`. Clicking it should open the image in a modal.

### Module 3: Shared Household Ledger
*   **FR-3.1:** The navigation sidebar shall include a "Group Wallets" section.
*   **FR-3.2:** A modal shall allow users to create a new group by providing a `groupName`.
*   **FR-3.3:** Inside a Group View, users shall be able to add member emails and view a group-specific transaction ledger.

### Module 5: Smart Subscription Radar
*   **FR-5.1:** The Dashboard shall render an "Upcoming Subscriptions" widget.
*   **FR-5.2:** The Dashboard shall display a "Safe to Spend" metric, visually distinct from the "Current Net Balance".

### Module 6: 1-Click UPI Settlements
*   **FR-6.1:** The Group View shall contain a "Settlements" tab displaying current peer-to-peer debts.
*   **FR-6.2:** If the user owes money, a "Settle Up" button shall be rendered.
*   **FR-6.3:** Clicking "Settle Up" on a mobile viewport shall trigger the `upi://pay` deep link. On a desktop viewport, it shall display a fallback QR Code for scanning.

## 3. Non-Functional Requirements (NFRs)
*   **NFR-1 (Responsiveness):** All components, especially the data tables and group views, must be fully responsive (mobile, tablet, desktop) using Tailwind utility classes.
*   **NFR-2 (Error Handling):** API failures (e.g., expired tokens, network errors) must be caught and displayed gracefully via Toast notifications, never crashing the React tree.
*   **NFR-3 (State Consistency):** Optimistic UI updates should be used where appropriate (e.g., toggling the tax-deductible flag should update the UI immediately before the API resolves).