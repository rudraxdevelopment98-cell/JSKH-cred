# JCred Admin Panel

Web administration panel for **JCred**, built with **React + Vite + Material UI**.
It consumes the [JCred backend API](../backend) and is restricted to `super_admin` users.

## Features

- **Login** — authenticates against the API; rejects non-admin accounts.
- **Overview** — live system stats (users, suspended accounts, families, vault
  items, shares, pending access requests, recent activity).
- **User Management** — list users; suspend / reinstate accounts.
- **Security Logs** — system-wide audit trail of logins, views, credential
  access, uploads, and permission changes.

Auth uses JWT access tokens with transparent refresh-token rotation handled by
the API client.

## Requirements

- Node.js ≥ 20
- A running [JCred backend](../backend) with at least one `super_admin` user
  (`npm run seed:admin` in the backend).

## Quick start

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173 (proxies /api → http://localhost:4000)
```

Build for production:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Creating an admin user

In the backend directory:

```bash
ADMIN_EMAIL=admin@jcred.app ADMIN_PASSWORD=your-password npm run seed:admin
```

Then log in to the panel with those credentials.

## Configuration

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE` | API base path (default `/api/v1`) |
| `VITE_API_TARGET` | Dev proxy target for the backend (default `http://localhost:4000`) |

## Project layout

```
src/
  api/        fetch client (token storage + auto-refresh) and useFetch hook
  auth/       AuthContext, ProtectedRoute
  components/ Layout (app bar + nav drawer)
  pages/      Login, Overview, Users, SecurityLogs
  theme.js    Material UI theme
  App.jsx     routes
  main.jsx    entry point
```
