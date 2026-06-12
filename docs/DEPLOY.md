# Deploying a JCred demo

The repository includes a [`render.yaml`](../render.yaml) blueprint that stands up
a live demo on [Render](https://render.com) with **one click**: a free PostgreSQL
database plus a single web service that serves both the API and the admin panel
from the same origin.

## One-click deploy (Render)

1. Push this repo to your own GitHub account (or use it directly if you have access).
2. Go to **render.com → New → Blueprint** and connect the repository.
3. Render reads `render.yaml` and shows the resources it will create
   (`jcred-db` and `jcred-demo`).
4. When prompted, set **`ADMIN_PASSWORD`** — this is the password for your admin login.
5. Click **Apply**. First build takes a few minutes.

When it's live, open the service URL:

- **Admin panel:** `https://<your-service>.onrender.com/`
- **Health check:** `https://<your-service>.onrender.com/health`
- **Login:** `admin@jcred.app` / the `ADMIN_PASSWORD` you set

> Render reads `render.yaml` from the repository's **default branch (`main`)**,
> so the project must be merged to `main` before deploying.

### What the blueprint does

- Provisions a free PostgreSQL instance and wires `DATABASE_URL` automatically.
- Generates `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `VAULT_ENCRYPTION_KEY`.
- **Build:** builds the admin panel and copies it into `backend/public`, then
  installs backend dependencies.
- **Start:** runs `npm run seed:admin` (creates/promotes the admin, idempotent)
  and starts the API, which also serves the admin SPA.

### Notes & caveats

- Free Render services **spin down when idle**; the first request after a pause
  takes ~30s to wake. Free databases expire after a set period — fine for a demo,
  not for production.
- CSP is relaxed when the API serves the SPA (the panel uses injected styles).
  For a hardened production deployment, host the admin as a separate static site
  with a proper Content-Security-Policy.

## Pointing the mobile app at the demo

Once deployed, run the Flutter app against the hosted API:

```bash
cd mobile
flutter run --dart-define=API_BASE=https://<your-service>.onrender.com/api/v1
```

## Other hosts

The same model works anywhere that runs a Node service + PostgreSQL
(Fly.io, Railway, a VM, or AWS per the architecture docs). Build the admin into
`backend/public`, set the environment variables from
[`backend/.env.example`](../backend/.env.example), and run `npm start`.
The provided [`backend/Dockerfile`](../backend/Dockerfile) and
[`backend/docker-compose.yml`](../backend/docker-compose.yml) cover container deploys.
