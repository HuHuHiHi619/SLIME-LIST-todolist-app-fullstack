# server/CLAUDE.md

Express backend for SlimeList. Supplements the root CLAUDE.md. Migration history → `server/MIGRATION.md`.

---

## Stack & Commands

Node + Express + Mongoose (MongoDB Atlas). Zod for HTTP validation. Jest for tests.

```bash
npm run dev        # nodemon on :5000  (sets NODE_ENV=development)
npm run dev:local  # dev with USE_LOCAL_DB=true
npm start          # production (sets NODE_ENV=production)
npm test           # Jest, 10s timeout — 64 tests across 10 suites
```

---

## Architecture

### The Module Pattern (use for all new domains)

```
modules/<domain>/
  controller.js   ← Zod validation, buildUserFilter, parse req, call service, send res
  service.js      ← business logic; throws ServiceError for 4xx; no req/res; no Express objects
  repository.js   ← Mongoose calls only; returns docs or lean arrays
  schema.js       ← Zod schemas for req.body validation (controller boundary only)
  helpers.js      ← ServiceError (task module only; others import from shared/errors.js)
```

`ServiceError`, `sendServiceError`, and `handleError` live in `shared/errors.js`. All modules
import from there. `task/`, `user/`, `category/`, and `summary/` follow this pattern.
`modules/auth/` is a shared helper module (no controller/service/repository split) — it owns JWT
signing and auth cookie helpers consumed by `user/`.
The `controllers/` directory has been fully dissolved — all utilities migrated to `shared/`.

### Auth model

Dual-mode: registered users carry a JWT (`req.user`); guests carry a `guestId` cookie. Every route
passes through `middleware/authOptional.js`, which silently downgrades any auth failure to guest.
`buildUserFilter(req)` (`shared/utils/userFilter.js`) resolves identity into the Mongoose ownership
filter — returns `null` filter when neither identity is present (callers must guard).

### Folder Map

| Folder | Responsibility |
|--------|---------------|
| `Config/` | MongoDB connection — loads `MONGO_URI` from the environment-specific `.env` file |
| `Routes/` | URL-to-handler wiring only; no business logic. `summaryRoutes.js` auto-loaded by `server.js` readdirSync |
| `modules/task/` | 3-layer + `schema.js` (Zod: CreateTaskSchema, UpdateTaskSchema) + `helpers.js` (ServiceError, compareTasksForFlatList, lookupCategoryByName + cache) |
| `modules/user/` | 3-layer + `schema.js` (Zod: RegisterSchema, LoginSchema) |
| `modules/category/` | 3-layer + `schema.js` (Zod: CreateCategorySchema) |
| `modules/summary/` | 2-layer (controller + repository) — dashboard aggregate handlers (completed rate, by-category, progress rate); routes at `/summary/*` |
| `modules/auth/` | Token signing (`signAccessToken`, `signRefreshToken`, `verifyRefreshToken`) + cookie helpers (`setAuthCookies`, `clearAuthCookies`, etc.) — used by `modules/user/` |
| `middleware/` | Cross-cutting: JWT auth, guest ID assignment, file upload |
| `Models/` | Mongoose schemas and pre-save hooks |
| `job/` | Cron tasks (overdue marking, streak reset) — mutate DB on a schedule |
| `shared/errors.js` | `ServiceError`, `sendServiceError`, `handleError` — imported by all module controllers and services |
| `shared/utils/` | Pure functions — `userFilter.js`, `deadlineUtils.js`, `cookieOptions.js`, `taskConstants.js`, `progressUtils.js` (processProgress, calculateProgress) |
| `shared/services/` | Domain services with DB access — `streakService.js` (streak + badge logic) |
| `utils/` | Legacy — `notification.js` (incomplete, do not expand) |
| `test/` | Jest tests — `test/utils/` for unit tests, `test/task/`, `test/user/`, `test/category/` for schema tests |

---

## Known Issues

Cluster A (2026-06-05) and Cluster B backend (2026-06-05) are resolved — see git history and `server/MIGRATION.md`. Live items below only.

---

## Risk Register

| File | Why risky | Test before touching |
|------|-----------|----------------------|
| `modules/task/service.js` | Core logic for all 8 task ops; calls `updateUserStreak` on completion | No integration tests — smoke-test every grouping mode + completion |
| `shared/errors.js` | Imported by all module controllers and services; owns `handleError`, `ServiceError`, `sendServiceError` | Verify all modules still boot after any change: `node -e "require('./modules/task/controller')"` etc. |
| `shared/utils/progressUtils.js` | `processProgress` and `calculateProgress` used by task service and summary controller | Run full test suite; spot-check progress step aggregation endpoint |
| `shared/services/streakService.js` | All streak + badge logic; called by task service + cron; hardcoded Bangkok TZ | Full `test/.test.js` must pass; test the midnight boundary |
| `middleware/authOptional.js` | Every route passes through it; silently downgrades to guest | Integration test 401 paths + the wrong-secret case |
| `server.js` | Auto-loads all Routes via readdirSync; inits cron; a startup error kills the server | Verify clean `npm run dev` after route/middleware changes |
| `job/cronJob.js` | Runs at midnight against all users; a bug resets every streak | Run `.test.js`; mock `Date.now()` at midnight boundary |
| `Config/db.js` | Wrong env silently points at a bad URI; server starts healthy, all DB calls fail | Confirm `MONGO_URI` before deploying; `/health` does not check DB |

---

## Do Not Touch

- `middleware/authOptional.js` — auth gateway for every route; no integration tests.
- `job/` — cron timing depends on timezone + `Date.now()` mocking; needs controlled time fixtures.
- `modules/auth/index.js` — JWT sign/verify secrets read lazily at call time; touching getter functions risks silent `undefined`-secret bugs.

---

## Development Gotchas

### Env var setup

Two env files, never committed:

| File | NODE_ENV | Database |
|------|----------|---------|
| `server/.env.development` | development | Atlas `slimelist-dev` |
| `server/.env.production` | production | Atlas `slimelist` |

`server.js` loads the right file at startup (line 1, before all other requires):
```js
require("dotenv").config({ path: path.join(__dirname, `.env.${(process.env.NODE_ENV||"development").trim()}`) })
```
npm scripts set `NODE_ENV` (`set NODE_ENV=development&&…` — **no space before `&&`**, or cmd appends a
trailing space to the value). `Config/db.js` reads `process.env.MONGO_URI` directly — no branching.
For Render.com: set `NODE_ENV=production` + all `.env.production` vars in the dashboard (file not deployed).

### Env var pitfalls
- `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` — read inside `modules/auth/index.js` (getter functions called at sign/verify time). A missing value makes JWTs sign/verify with `undefined`, so any token passes silently.

### Zod validation boundary
All HTTP body validation happens at the controller via `schema.js` in each module. Zod errors are returned as `{ error: parsed.error.issues[0].message }` (first failing rule, plain string) — matches the frontend's existing `throw new Error(resError?.error)` fallback. Business-rule errors (entity not found, duplicate user, date ordering) remain throws in `service.js`.

### Silent failure patterns
- `authOptional.js` catches all JWT errors and continues as guest — bad secret, expired, and tampered tokens all look identical; no distinguishing log.
- `Config/db.js` logs a connection error but does not exit or set a health flag; `/health` returns 200 even when MongoDB is unreachable.

### Timezone edge cases in streak logic
- `updateUserStreak` converts dates to `"Asia/Bangkok"` (UTC+7). The cron reset runs at midnight server time — if the server isn't UTC+7, reset and streak calc use different day boundaries.
- `differenceInDays` is time-component sensitive; both dates pass through `startOfDay` before the diff — keep that if the TZ conversion changes.
- The `dayDifference === 0` (same-day) branch does not update `lastCompleted`; a completion just after Bangkok midnight while `lastCompleted` is the prior calendar day can double-increment the streak.

---

