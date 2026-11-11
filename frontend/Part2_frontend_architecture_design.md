# FinTrack Frontend: Architecture & Design Mapping

## 1. Component Architecture

### 1.1 Layout & Navigation
*   `AppLayout`: Main wrapper containing the sidebar, top header (with Light/Dark theme toggle), and main content area.
*   `Sidebar`: Navigation links (Dashboard, Personal Ledger, Group Wallets, Settings).

### 1.2 New Advanced Components
*   **Module 1 & 2 (Files)**
    *   `FileUploadZone`: A reusable drag-and-drop component accepting file types and size limits as props.
    *   `ReceiptModal`: A lightbox component to view S3 image URLs.
*   **Module 3 (Groups)**
    *   `GroupCard`: Displays group name, member count, and net balance summary.
    *   `GroupLedgerView`: Inherits the base `TransactionList` but scopes API calls to `/groups/{id}/transactions`.
*   **Module 5 (Radar)**
    *   `ForecastWidget`: A dashboard card iterating over the `predictedSubscriptions` array.
*   **Module 6 (UPI)**
    *   `SettlementCard`: Displays "You owe [Name] [Amount]".
    *   `UPIActionBtn`: Detects device type; acts as a standard `<a>` tag with the `upi://` protocol on mobile, or triggers a QR modal on desktop.

## 2. State Management Strategy
*   **Local State:** Use React `useState` for form inputs, modal visibility, and UI toggles.
*   **Global/Server State:** Use a lightweight data-fetching library (like React Query or SWR) or custom hooks (`useTransactions`, `useGroups`) to manage API caching, loading states, and refetching.
*   **Authentication State:** Maintain the Cognito JWT in memory/Context, hydrating from `localStorage`/`sessionStorage` on initial load.

## 3. API Integration Handlers (Services)
Create an `api.js` or `services/` directory to encapsulate fetch logic:
*   `fetchPresignedUrl(type)`: Calls `GET /uploads/presigned-url`.
*   `uploadToS3(url, file)`: Executes the `PUT` request to the Amazon S3 Vault.
*   `importCSV(s3ObjectKey)`: Calls `POST /transactions/import`.
*   `getForecast()`: Calls `GET /analytics/forecast`.
*   `getSettlements(groupId)`: Calls `GET /groups/{groupId}/settlements`.

## 4. UI/UX Constraints Reminder
*   Adhere strictly to the `frontend_design.md` specifications.
*   Enforce Tailwind classes `dark:bg-gray-900`, `dark:text-white`, etc., across all new components.
*   Ensure tabular numbers (`tabular-nums`) for all monetary values.