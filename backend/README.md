# JCred Backend

REST API for **JCred — Your Family's Secure Digital Vault**.

Node.js + Express + PostgreSQL, with JWT auth, AES-256-GCM encryption for stored
secrets, role- and permission-based access control, sharing, access requests,
notifications, and append-only activity logging.

## Requirements

- Node.js ≥ 20
- PostgreSQL ≥ 14 (uses the `pgcrypto` and `citext` extensions)

## Quick start

```bash
cp .env.example .env          # then edit secrets
npm install
npm run migrate               # apply schema migrations
npm start                     # boots on :4000 (also runs pending migrations)
```

### With Docker

```bash
docker compose up --build     # starts Postgres, Redis, and the API
```

## Configuration

See [`.env.example`](./.env.example). Key variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `VAULT_ENCRYPTION_KEY` | 32-byte AES-256 key (base64 or hex) |
| `RATE_LIMIT_*` | Request rate limiting |

Generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Tests

Integration tests run against a real PostgreSQL database using Node's built-in
test runner and `supertest`.

```bash
# point at a test database
export DATABASE_URL='postgres://jcred:jcred@localhost:5432/jcred'
export NODE_ENV=test
npm test
```

## Project layout

```
src/
  config/        env loading
  crypto/        AES-256-GCM, bcrypt, JWT/refresh tokens
  db/            pg pool, migration runner, SQL migrations
  middleware/    auth, role checks, validation, rate limit, errors
  modules/
    auth/        register, login, refresh (rotating), sessions
    users/       admin user management
    families/    family groups, invitations, roles
    items/       encrypted vault items + access resolver
    shares/      per-item sharing & permissions
    accessRequests/  request → approve/deny → auto-grant share
    notifications/   in-app notifications
    activity/    append-only audit log
  app.js         express app assembly
  server.js      boot, migrate, graceful shutdown
test/            integration tests
```

## API surface

Base path: `/api/v1`. See [`../docs/API.md`](../docs/API.md) for the full list.
Health check: `GET /health`.

### Auth & security highlights

- **Passwords** hashed with bcrypt (cost 12).
- **Secrets** (credential fields, note bodies) encrypted with AES-256-GCM before
  storage; ciphertext + IV + auth tag are kept in a JSONB column. Plaintext is
  only returned via the explicit `GET /items/:id/reveal` endpoint.
- **Refresh tokens** are opaque random strings; only their SHA-256 hash is
  stored, and they rotate on every refresh (reuse is rejected).
- **Access control** is enforced on two axes: global role
  (`super_admin` / `family_admin` / `member`) and per-item permission
  (`private` → `view_only` → `view_download` → `edit`, plus `temporary` and
  `emergency`). Item existence is hidden (404) from users without access.
- **Auditing**: logins, views, credential access, uploads, and permission
  changes are written to `activity_logs`.
