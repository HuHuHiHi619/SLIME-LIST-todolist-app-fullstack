# CLAUDE.md

Guidance for Claude Code when working in this repository.

---

## Project Overview

**SlimeList** — a gamified fullstack todo app. Users earn streaks, badges (iron → bronze → silver → gold), and track task progress with subtasks. Supports both registered JWT users and anonymous guest users.

---

## Commands

### Frontend (`/frontend`)
```bash
npm run dev        # Dev server on port 5173
npm run build      # Production build
npm run lint       # ESLint check
npm run preview    # Preview production build
npm test           # Vitest — 83 tests across 17 files
```

### Backend (`/server`)
```bash
npm run dev        # nodemon dev server on port 5000
npm run dev:local  # Dev with local MongoDB (USE_LOCAL_DB=true)
npm start          # Production
npm test           # Jest (10s timeout) — 93 tests
```

### Docker (full stack)
```bash
docker-compose up  # Runs frontend + backend + MongoDB together
```

---

## Architecture

### Monorepo Layout
Two independent apps — `frontend/` (React + Vite) and `server/` (Express) — with no shared workspace config. Docker Compose wires them together locally.

### Frontend–Backend Communication
- Axios instance in `frontend/src/Config/` with `withCredentials: true` (cookie-based auth)
- Dev base URL: `http://localhost:5000/api`; production: relative `/api` (proxied via Netlify)
- **Token refresh interceptor**: On 401, queues pending requests, fetches a new access token from `/refreshToken`, then replays them — prevents race conditions on concurrent calls

### State Management
Redux Toolkit with three slices in `frontend/src/redux/`:
- `taskSlice` — task CRUD and filter state; `streakStatus` persisted to `localStorage` via `streakMiddleware` in `store.jsx`
- `userSlice` — auth state (registered vs. guest), profile data
- `summarySlice` — dashboard analytics (completion rates, badge progress)

### Auth Model
Dual-mode auth in `server/middleware/`:
- **Registered users**: JWT access token + refresh token stored in HTTP-only cookies
- **Guest users**: `guestId` middleware assigns a persistent anonymous ID
- Both flows share the same task routes; controllers branch on `req.user` vs `req.guestId`

### Database
MongoDB (Atlas in production, local URI for dev). All models in `server/Models/` use Mongoose with timestamps. Key relationships:
- `Tasks` → `Category` and `Tag` via ObjectId refs
- `User` embeds a notifications array and streak/badge fields

### Cron Jobs (`server/job/`)
- **Overdue task marking**: runs daily at midnight
- **Streak reset**: checks `lastCompleted` date on each user; resets streak if broken
- These mutate DB state on a schedule — test task/streak logic with that in mind

### Deployment
- Frontend → Netlify (GitHub Actions: `.github/workflows/netlify-deploy.yml`)
- Backend → Render.com
- DB → MongoDB Atlas

---

## Environment Variables

**`server/.env.development`** and **`server/.env.production`** (never committed — gitignored)

| Key | Purpose |
|-----|---------|
| `ACCESS_TOKEN_SECRET` | JWT signing secret |
| `REFRESH_TOKEN_SECRET` | JWT refresh secret |
| `PORT` | `5000` |
| `NODE_ENV` | `development` / `production` (also set by npm script) |
| `MONGO_URI` | Atlas `slimelist-dev` (dev) · Atlas `slimelist` (prod) |

`NODE_ENV` is set by the npm scripts before the process starts (`set NODE_ENV=development&&nodemon server.js` — **no space before `&&`**). `server.js` loads the correct file at startup via `path.join(__dirname, \`.env.${NODE_ENV.trim()}\`)`. No `LOCAL_URI` or `IS_PRODUCTION` — removed when env was split into per-environment files.

**`frontend/.env`**
```
VITE_API_URL=         # Production API base URL
VITE_LOCAL_API_URL=http://localhost:5000/api
```

---

## Working with this Codebase

### Role & Tone
Act as a Senior Full-Stack Developer and Mentor. Explain the architectural "why", trade-offs, and best practices. Be concise — use targeted diffs, not full-file reprints.

### Workspace Rules
- When working on frontend tasks, read and follow `frontend/CLAUDE.md`.
- When working on backend tasks, read and follow `server/CLAUDE.md`.
- Ask before reading across workspaces.


### Security Rules
- When reading `.env` files, never print actual secret values. Show keys as: `SECRET_KEY=******`
- Never include real credentials in any code suggestions.

## Suggested skills / tooling
`/scrutinize` (before any fix plan) · `/diagnose` (trace-before-fix) · `/verify` (run the app after a change) ·
`/tdd` (Vitest/Jest regressions) · `/code-review` before committing a phase ·
`server-patterns` skill before editing backend modules.

---

## Canonical Docs

Read these before making design decisions. They define the live domain model.

| Doc | About |
|-----|-------|
| `.claude/docs/PRODUCT_VISION.md` | Product goal, core loop, pillars |
| `.claude/docs/GAMIFICATION_SYSTEM.md` | EXP/happiness/streak constants, evolution gates |
| `.claude/docs/UX_UI_ARCHITECTURE.md` | Navigation, layouts, roadmap phases |
| `.claude/docs/USER_FLOW.md` | Guest / auth / pomodoro user flows |
| `.claude/assets/ASSET_ROADMAP.md` | Art phases and layer system |
| `.claude/docs/UI_TOKENS.md` | Design tokens — read before writing any Tailwind classes |
| `.claude/designs/` | Screenshots for UI implementation reference |
| `docs/adr/` | Architecture Decision Records — read before reversing a design decision |

---

## Plan Priority

- Active plan: `.claude/plans/active.md`
- Queue: `.claude/plans/queue.md`

Always read `.claude/plans/active.md` before starting work. Never begin Phase N+1 without completing Phase N and marking it done in the plan.