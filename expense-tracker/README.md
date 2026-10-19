# Expense Tracker (Data-Driven System)

Full-stack expense tracker: **React (Vite)** frontend, **Node.js + Express** backend, **MongoDB** database.
Income/expense categorization, monthly & yearly summaries via MongoDB aggregation pipelines,
JWT auth, charts (Recharts).

## Folder structure (production-ready)

```
expense-tracker/
├── server/                  # Express API (MVC)
│   ├── config/db.js
│   ├── models/              # User, Transaction
│   ├── controllers/         # auth, transaction, summary
│   ├── routes/              # /api/auth /api/transactions /api/summary
│   ├── middleware/          # JWT auth, error handler
│   └── server.js
└── client/                  # React SPA (Vite)
    └── src/
        ├── api.js           # Axios instance
        ├── context/AuthContext.jsx
        ├── components/      # Navbar, ProtectedRoute
        └── pages/           # Login, Register, Dashboard, Transactions
```

## APIs

| Method | Endpoint                          | Auth | Description |
|--------|-----------------------------------|------|-------------|
| POST   | /api/auth/register                | –    | Create account |
| POST   | /api/auth/login                   | –    | Login → JWT |
| GET    | /api/transactions                 | JWT  | List (filters: type, category, month) |
| POST   | /api/transactions                 | JWT  | Create |
| PUT    | /api/transactions/:id             | JWT  | Update (owner only) |
| DELETE | /api/transactions/:id             | JWT  | Delete (owner only) |
| GET    | /api/summary/monthly?year=&month= | JWT  | Month totals, by-category, daily series |
| GET    | /api/summary/yearly?year=         | JWT  | Per-month income/expense/balance for the year |

Categories: Salary, Freelance, Business, Investments, Other (income) ·
Food, Rent, Transport, Utilities, Entertainment, Health, Shopping, Education, Other (expense).

## Run locally

```bash
# Terminal 1 — API
cd server
cp .env.example .env          # set MONGO_URI + JWT_SECRET
npm install
npm run dev                   # http://localhost:5000

# Terminal 2 — React app
cd client
npm install
npm run dev                   # http://localhost:5170 (proxies /api → :5000)
```

## Deploy to production

- **MongoDB Atlas**: free cluster → create a database user → allow access from anywhere (0.0.0.0/0) → copy connection string.
- **Backend (Render)**: New → Web Service → repo `server/` as root (or set Root Directory = `server`).
  Build `npm install`, start `npm start`. Env vars: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`.
- **Frontend (Vercel)**: import repo, set Root Directory = `client`, framework Vite. Add env var
  `VITE_API_URL=https://your-render-app.onrender.com` (defaults to same-origin `/api` for local dev).

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: expense tracker"
git branch -M main
git remote add origin https://github.com/0pradyumn/expense-tracker.git
git push -u origin main
```

> `.env` files are git-ignored. Never commit secrets.
