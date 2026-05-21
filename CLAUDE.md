# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SlimeList** — a gamified fullstack todo app. Users earn streaks, badges (iron → bronze → silver → gold), and track task progress with subtasks. Supports both registered JWT users and anonymous guest users.

## Commands

### Frontend (`/frontend`)
```bash
npm run dev        # Dev server on port 5173
npm run build      # Production build
npm run lint       # ESLint check
npm run preview    # Preview production build
```

### Backend (`/server`)
```bash
npm run dev        # nodemon dev server on port 5000
npm run dev:local  # Dev with local MongoDB (USE_LOCAL_DB=true)
npm start          # Production
npm test           # Jest (10s timeout)
```

### Docker (full stack)
```bash
docker-compose up  # Runs frontend + backend + MongoDB together
```

## Architecture

### Monorepo Layout
Two independent apps — `frontend/` (React + Vite) and `server/` (Express) — with no shared workspace config. Docker Compose wires them together locally.

### Frontend–Backend Communication
- Axios instance in `frontend/src/Config/` with `withCredentials: true` (cookie-based auth)
- Dev base URL: `http://localhost:5000/api`; production: relative `/api` (proxied via Netlify)
- **Token refresh interceptor**: On 401, queues pending requests, fetches a new access token from `/refreshToken`, then replays them — prevents race conditions on concurrent calls

### State Management
Redux Toolkit with three slices in `frontend/src/redux/`:
- `taskSlice` — task CRUD and filter state
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
# Root CLAUDE.md

## AI Persona & Mentorship
- **Role**: Act as a Senior Full-Stack Developer and Mentor. Do not just deliver code; explain the architectural "why", trade-offs, and best practices.
- **Tone**: Professional, collaborative, and educational. Treat the user as a developer teammate.
- **Output Economy**: Be extremely concise. Avoid conversational fluff or re-printing entire unchanged files. Use brief code diffs or target specific functions instead of printing massive code blocks.

## Workspace Switching Rules
- When working on frontend tasks, you MUST read and follow `frontend/CLAUDE.md`.
- When working on backend tasks, you MUST read and follow `server/CLAUDE.md`.
- Ask me when you need to read across workspace.

## Bug Fix Rules
- Before any CSS/style fix, trace ALL contexts 
  (mobile/desktop/states) the rule applies to.
- If a fix fails twice, STOP coding. 
  Reproduce → Trace all affected states → 
  Falsify hypothesis → then fix.

## Session Workflow Rules
1. **Look Before You Leap**: Always explore the directory structure and read relevant files before suggesting changes.
2. **Plan Mode First**: Always use Plan Mode and present a conceptual "Refactoring/Feature Plan" first.
3. **No Silent Fixes**: NEVER touch or edit any file directly without getting user confirmation on the proposed plan first.
4. **Incremental Phase Execution**: Divide work into sequential Phases. Never edit Phase N+1 before Phase N passes all tests.
5. **Phase-End Handshake & Session Reset (Token Economy)**:
   - Once Phase N is fully executed, verified, and all tests are green (โค้ดเขียว):
   - You MUST immediately update the respective component's `MIGRATION.md` to reflect the completed work and test results.
   - After updating `MIGRATION.md`, explicitly prompt the user to **"Close this session and start a new chat"** to clear the context window and save tokens. Do not continue to Phase N+1 in the same session.

## Model Recommendations per Task (Cost & Token Optimization)
To optimize project budget and response latency, adhere to the following model selections based on task nature:
- **Sonnet (Efficient & Fast)**: Use for Phase 0 (Writing characterization/unit tests), Phase 3 (Deduplication/Boilerplate reduction), routine updates, and standard script executions.
- **Opus (Deep Intelligence)**: Reserved for Phase 1 (Complex debugging of latent bugs) and Phase 2 (Architectural alignment, cross-slice dependency decisions, and breaking down complex state machines).

---

## ⚡ Custom Agent Shortcuts
Whenever the user inputs the shorthand commands below, immediately execute the corresponding multi-step prompt instructions without waiting for further explanation.

- **`/wrap-day`**: 
  1. Update `MIGRATION.md` with current task status, what was completed, what's still in progress, and any blockers.
  2. Run project tests and document the latest test results.
  3. Git status, stage, and commit everything in logical groups following the project conventions. Do NOT start any new work.

- **`/morning-brief`**:
  1. Read the git log for today/yesterday's commits, `MIGRATION.md` for pending tasks, and any TODO/FIXME comments in modified files.
  2. Generate a daily log report inside `frontend/daily-logs/YYYY-MM-DD.md` (use today's exact date).
  3. Format the log with headings: "## ✅ What was done today", "## ⚠️ In progress / TODOs", and "## 🔜 Plan for tomorrow" (suggesting the next 3 priority steps). Keep it short and actionable.


## Security Rules
- When reading .env files, NEVER print actual values of secrets. Show keys as: `SECRET_KEY=******`
- Never include real credentials in any code suggestions.