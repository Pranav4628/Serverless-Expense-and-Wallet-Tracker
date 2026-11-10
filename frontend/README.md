# FinTrack – Expense & Wallet Tracker (Frontend)

React SPA for tracking income and expenses against a serverless AWS backend (Amazon Cognito, API Gateway, Lambda, DynamoDB, S3).

## Features

- **Auth** — Sign up, email OTP verification, login, logout, forgot password (Cognito)
- **Dashboard** — Income, expenses, and net balance with date-range filters
- **Expense breakdown** — Category doughnut chart and amounts list
- **Transactions** — Paginated ledger with search/filters and add / edit / delete
- **Theme** — Light / dark mode
- **Responsive layout** — Sidebar (desktop), bottom nav (mobile)

## Tech stack

| Layer        | Choice                                      |
|--------------|---------------------------------------------|
| UI           | React 19 + Vite 8                           |
| Routing      | react-router-dom                            |
| State        | React Context (`Auth`, `Transaction`, `Theme`) |
| HTTP         | Axios (JWT interceptor, 401 auto-logout)    |
| Auth         | `amazon-cognito-identity-js`                |
| Charts       | Recharts                                    |
| Styling      | Tailwind CSS 3 + lucide-react               |

## Prerequisites

- Node.js 18+ (recommended)
- npm
- AWS Cognito User Pool + App Client
- Deployed API Gateway base URL for the FinTrack backend

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` with your AWS values:

```env
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_API_BASE_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/prod
```

> Use the real API stage path your backend exposes. Do not commit `.env` (it is gitignored).

## Scripts

```bash
npm run dev       # local dev server (Vite)
npm run build     # production build → dist/
npm run preview   # preview the production build
npm run lint      # ESLint
```

## Project structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, SignUp, OTP, ForgotPassword
│   │   ├── common/         # Modal, dialogs, spinner, ErrorBoundary
│   │   ├── dashboard/      # Stat cards, chart, recent list, date filter
│   │   ├── layout/         # Header, Sidebar, BottomNav, ProtectedRoute
│   │   └── transactions/   # Table, modal, filters, receipt uploader
│   ├── context/            # Auth, Transaction, Theme providers
│   ├── pages/              # DashboardPage, TransactionsPage
│   ├── services/           # Axios client, Cognito auth, transaction APIs
│   ├── utils/              # Currency/date formatters, category lists
│   ├── App.jsx             # Routes + providers
│   ├── main.jsx            # Entry
│   └── index.css           # Tailwind + design tokens
├── .env.example
├── package.json
└── vite.config.js
```

## Routes

| Path               | Access    | Description              |
|--------------------|-----------|--------------------------|
| `/login`           | Public    | Sign in                  |
| `/signup`          | Public    | Register                 |
| `/verify`          | Public    | Email OTP confirmation   |
| `/forgot-password` | Public    | Password reset           |
| `/dashboard`       | Protected | Overview + analytics     |
| `/transactions`    | Protected | Full transaction ledger  |
| `/`                | Redirect  | → `/dashboard`           |

## Backend API (expected)

All requests send `Authorization: Bearer <Cognito ID or access token>`.

| Method | Endpoint                    | Purpose                |
|--------|-----------------------------|------------------------|
| GET    | `/transactions`             | List (paginated/filter)|
| GET    | `/transactions/:id`         | Get one                |
| POST   | `/transactions`             | Create                 |
| PUT    | `/transactions/:id`         | Update                 |
| DELETE | `/transactions/:id`         | Delete                 |
| GET    | `/analytics/summary`        | Income / expense / balance |
| GET    | `/analytics/categories`     | Category breakdown     |
| POST   | `/receipts/presigned-url`   | S3 upload URL          |

## Auth flow

1. Sign up with Cognito → verify email OTP → log in  
2. ID / access tokens stored in `localStorage` (`fintrack_*` keys)  
3. `AuthContext` restores session on load  
4. `ProtectedRoute` guards app pages  
5. Axios clears session and redirects to `/login` on `401`

## Design docs

Additional specs live in this folder:

- `frontend_requirements_specification.md`
- `frontend_architecture_design.md`
- `frontend_design.md`
- `frontend_implementation_plan.md`
- `frontend_task_execution_list.md`

## Notes

- Currency display uses **INR** (`en-IN`).
- Receipt upload UI exists; wire it to the presigned-URL helpers in `transactionService` when S3 is ready.
- This repo is **frontend only** — Lambda / DynamoDB / infrastructure are managed separately.
