## Family Calendar PWA

Mobile-first PWA for families to share one-off and recurring events, receive twice-daily push reminders, and manage a lightweight shared membership flow.

### Project structure

- `backend/` – Express API (Node 20+) with SQLite (`better-sqlite3`), JWT auth, recurring event expansion, push scheduler, and VAPID integration.
- `frontend/` – Vite + React + Tailwind client with Today/Calendar/Settings views, Add-Event sheet, service worker, and push subscription UI.

### Environment variables

Copy each `.env.example`:

```
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
```

Backend variables:

| Key | Description |
| --- | --- |
| `NODE_ENV` | `development` or `production`. |
| `PORT` | API port (default `4000`). |
| `DATABASE_URL` | SQLite location (e.g., `file:./db/family-calendar.sqlite`). |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Push keys from `npx web-push generate-vapid-keys`. |
| `VAPID_SUBJECT` | Contact URI, e.g., `mailto:you@example.com`. |
| `JWT_SECRET` | Long random string for signing tokens. |

Reserved ports (via `portman.py`):

- Backend API: `4006`
- Frontend dev server: `5000`

Frontend variables:

| Key | Description |
| --- | --- |
| `VITE_API_URL` | Usually `/api` when reverse proxied through Nginx. |
| `VITE_PUSH_PUBLIC_KEY` | Optional override; otherwise fetched from `/api/push/public-key`. |

### Backend workflow

```
cd backend
npm install
npm run dev     # nodemon
npm start       # production
```

Key files:

- `src/index.js` – Express app bootstrapping `/api` routes and the push digest scheduler.
- `src/db.js` – SQLite connection + schema migrations for users, families, events, and memberships.
- `src/routes/*.js` – Auth (`/auth/join-family`), profile (`/me`), events CRUD with recurring expansion, and push subscription endpoints.
- `src/services/eventsService.js` – Expands daily/weekly/monthly repeat rules at read time and builds digest summaries.
- `src/scheduler/digests.js` – Node-cron jobs at 07:00 and 20:00 that gather events per family and deliver notifications via `web-push`.

Generate VAPID keys once:

```
cd backend
npx web-push generate-vapid-keys
# Paste the output into .env (PUBLIC/PRIVATE/SUBJECT)
```

### Frontend workflow

```
cd frontend
npm install
npm run dev     # Vite dev server
npm run build   # production build outputs to frontend/dist
```

Highlights:

- `src/context/AppContext.jsx` centralizes auth token storage, profile fetches, event caching, CRUD helpers, and push subscription requests.
- `src/pages/TodayView.jsx`, `CalendarView.jsx`, `Settings.jsx`, `JoinFamily.jsx` implement the required UI screens.
- `src/components/AddEventSheet.jsx` provides the mobile-friendly form (title/date/time/repeat/member assignment).
- `public/service-worker.js` caches shell assets and handles push notifications; `public/manifest.json` enables installation.

### Deployment (Docker Compose, no PM2)

The repo now ships with a production-oriented `docker-compose.yml` so the app can be deployed without PM2 or any Node-level process manager.

1. Copy `backend/.env.example` to `backend/.env` and fill in the secrets (`JWT_SECRET`, `VAPID_*`). For Docker the database path is overridden to `file:/data/family-calendar.sqlite`, which is backed by the named `calendar-data` volume.
2. (Optional) Create a project-root `.env` to override Compose build/run values, e.g.
   ```
   API_PORT=4006              # container + host port for the API
   VITE_API_URL=/api          # what the frontend bakes in at build time
   VITE_PUSH_PUBLIC_KEY=...   # override if you need to pin a public key at build
   DOCKER_DATABASE_URL=file:/data/family-calendar.sqlite
   ```
3. Build and start everything with `docker compose up -d --build`. This runs the backend on port `API_PORT` (default `4006`) and serves the built frontend + reverse proxy on `http://localhost:8080`.
4. Tail logs with `docker compose logs -f backend` (API/scheduler) or `docker compose logs -f frontend` (Nginx/Vite assets).
5. Put any TLS termination or vanity domains in front of the `frontend` service (e.g., Traefik/Caddy or a host-level Nginx) and proxy `/api` internally—the included Nginx config already forwards `/api` traffic to the backend container.

The `calendar-data` volume keeps the SQLite file outside the container image so upgrades only require `docker compose pull` / `docker compose up -d`.

### Testing & future work

- `frontend`: `npm run build` (already executed) validates the Vite bundle.
- Consider adding API/unit tests, edit/delete flows in the UI, drag-and-drop calendar interactions, quiet hours, or iCal exports as described in the spec’s “Future enhancements”.
