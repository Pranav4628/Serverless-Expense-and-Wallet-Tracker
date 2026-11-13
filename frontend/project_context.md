# FinTrack: Project Context & Master Specification

## 1. Project Overview
**FinTrack** is a full-stack, serverless personal finance and shared wallet application. It goes beyond standard expense trackers by offering advanced features like CSV statement parsing, receipt auditing, predictive cashflow analysis, and real-time shared household ledgers with instant UPI settlement links. 

**Target Region:** AWS `ap-south-1` (Mumbai)
**Tier:** 100% AWS Free Tier

---

## 2. Technology Stack
*   **Frontend:** React.js (Vite), Tailwind CSS (strict adherence to professional, minimal design).
*   **Backend Compute:** AWS Lambda (Node.js 20.x with AWS SDK v3).
*   **Database:** Amazon DynamoDB (Single-Table Design).
*   **Authentication:** Amazon Cognito (User Pools, JWT Authorization).
*   **API Layer:** Amazon API Gateway (REST API).
*   **Storage:** Amazon S3 (Vault for secure file uploads & Static Web Hosting).

---

## 3. Current Project State
*   **Backend Status: 100% Complete.** All AWS infrastructure (DynamoDB, Cognito, IAM, API Gateway, S3, and Lambda functions) has been manually configured and successfully tested in the AWS Management Console. 
*   **Frontend Status: Baseline complete, awaiting Redesign & Advanced Features.** The initial React app handles basic Auth and CRUD, but needs a complete UI/UX overhaul (Light/Dark mode, professional enterprise styling) and the implementation of the UI components for the advanced modules.
*   **Note to AI Assistant (Kiro):** DO NOT generate Infrastructure as Code (IaC) like Terraform or CDK, and DO NOT rewrite the backend Lambda functions. Your primary job is to build the React frontend and wire it to the existing API Gateway endpoints.

---

## 4. Advanced Features (Modules to Build on Frontend)

We are implementing 5 core advanced modules (Feature 4 is currently on hold):

### Module 1: Universal Bank & UPI Statement Importer
*   **Goal:** Users drag-and-drop monthly bank CSVs (HDFC, SBI, etc.). 
*   **Flow:** Frontend requests an S3 Presigned URL -> uploads CSV directly to S3 -> calls `/transactions/import` with the `s3ObjectKey`.
*   **Backend Behavior:** Lambda parses the CSV, auto-categorizes based on keywords, and bulk-inserts into DynamoDB.

### Module 2: S3 Receipt Vault & Tax Audit Flagging
*   **Goal:** Attach physical receipt images to transactions for tax auditing.
*   **Flow:** Frontend requests Presigned URL -> uploads image to S3 -> adds `receiptUrl` and `taxDeductible: true` to the standard `/transactions` POST payload.

### Module 3: Shared Household Ledger
*   **Goal:** Multi-user group wallets (e.g., roommates sharing apartment expenses).
*   **Flow:** Users can create groups (`/groups`), invite members via email/ID (`/groups/{id}/members`), and view a strictly isolated shared ledger (`/groups/{id}/transactions`).

### Module 5: Smart Subscription Radar & Forecasting
*   **Goal:** Proactively predict upcoming fixed expenses based on 90-day ledger history.
*   **Flow:** Frontend calls `/analytics/forecast`. Displays a widget showing "Upcoming Fixed Expenses" and calculates a "Safe to Spend" balance.

### Module 6: 1-Click UPI Settlements
*   **Goal:** Instantly settle debts within a Shared Household Ledger without switching apps.
*   **Flow:** Frontend calls `/groups/{id}/settlements` to get peer-to-peer debts. UI generates a dynamic deep link (`upi://pay?pa=...`) so users can click "Settle Up" to launch GPay/PhonePe directly.

---

## 5. AWS Services & Usage Context

| AWS Service | FinTrack Purpose |
| :--- | :--- |
| **Amazon Cognito** | Manages user sign-up/login. Provides the `sub` (User ID) injected via API Gateway into Lambda. |
| **Amazon API Gateway** | Exposes REST endpoints (`/transactions`, `/groups`, `/import`, `/forecast`). Protected by Cognito Authorizer. |
| **AWS Lambda** | Contains business logic. Five handlers: `TransactionsHandler`, `AnalyticsHandler`, `CSVParserHandler`, `GroupHandler`, `ForecastHandler`. |
| **Amazon S3** | **1. Vault Bucket:** Private bucket for CSV and receipt image uploads via Presigned URLs.<br>**2. Hosting Bucket:** Hosts the production React build (CloudFront CDN to be added later). |
| **Amazon DynamoDB** | Single-table NoSQL store (`FinTrackLedger`). |

---

## 6. DynamoDB Data Schema (For UI Mapping Reference)

The frontend should expect data structured around this Single-Table design:

*   **Standard Transaction:** `PK = USER#<id>`, `SK = TX#<timestamp>#<tx_id>`. Contains `amount`, `category`, `type`, `receiptUrl`, `taxDeductible`.
*   **Group Metadata:** `PK = GROUP#<id>`, `SK = METADATA`.
*   **Group Membership:** `PK = GROUP#<id>`, `SK = USER#<id>`. Uses `GSI2` to allow users to fetch groups they belong to.
*   **Group Transaction:** `PK = GROUP#<id>`, `SK = TX#<timestamp>#<tx_id>`. Contains `paidBy` (User ID).

---

## 7. Frontend Design Constraints
The UI must strictly follow these rules:
1.  **Professional & Modern:** Clean, data-dense, minimalist. No toy-like aesthetics.
2.  **Color Palette:** Monochromatic base (grays/slates) with a single primary brand color (Indigo/Blue). Semantic colors strictly for states (Green=Income, Red=Expense, Amber=Warning).
3.  **Theming:** Must support both Light Mode (white/gray-50) and Dark Mode (gray-900/gray-800). No pure black (`#000000`).
4.  **Animations:** Snappy and subtle (150-200ms fades, slight scaling on buttons). No long or bouncy animations.
5.  **Typography:** Sans-serif (Inter/Roboto), with tabular lining (monospaced numbers) for all currency displays so decimal points align vertically.