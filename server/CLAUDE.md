# server/CLAUDE.md

Express backend for SlimeList. Supplements the root CLAUDE.md. Migration history → `server/MIGRATION.md`.

---

## Stack & Commands

Node + Express + Mongoose (MongoDB Atlas). Jest for tests.

```bash
npm run dev        # nodemon on :5000  (sets NODE_ENV=development)
npm run dev:local  # dev with USE_LOCAL_DB=true
npm start          # production (sets NODE_ENV=production)
npm test           # Jest, 10s timeout — 25 tests
```

---

## Architecture

### The Module Pattern (use for all new domains)

```
modules/<domain>/
  controller.js   ← import buildUserFilter; parse req; call service; send res
  service.js      ← business logic; throws ServiceError for 4xx; no req/res
  repository.js   ← Mongoose calls only; returns docs or lean arrays
```

`ServiceError` is defined in each module's `service.js`. Controllers catch it and map to the HTTP
status. `task/`, `user/`, and `category/` follow this pattern.
`modules/auth/` is a shared helper module (no controller/service/repository split) — it owns JWT
signing and auth cookie helpers consumed by `user/`.
`AggregateController.js` remains in `controllers/` (not split into a module) but is cleaned up:
`buildUserFilter` wired, duplicate `$lookup` removed, `calculateProgress` used.

### Auth model

Dual-mode: registered users carry a JWT (`req.user`); guests carry a `guestId` cookie. Every route
passes through `middleware/authOptional.js`, which silently downgrades any auth failure to guest.
`buildUserFilter(req)` (`shared/utils/userFilter.js`) resolves identity into the Mongoose ownership
filter — returns `null` filter when neither identity is present (callers must guard).

### Folder Map

| Folder | Responsibility |
|--------|---------------|
| `Config/` | MongoDB connection — loads `MONGO_URI` from the environment-specific `.env` file |
| `Routes/` | URL-to-handler wiring only; no business logic |
| `modules/task/`, `modules/user/`, `modules/category/` | Converted domains — the established 3-layer pattern |
| `modules/auth/` | Token signing (`signAccessToken`, `signRefreshToken`, `verifyRefreshToken`) + cookie helpers (`setAuthCookies`, `clearAuthCookies`, etc.) — used by `modules/user/` |
| `controllers/` | Legacy — `helperController.js` owns shared utilities; `TasksController.js`, `removeController.js`, `UserController.js`, `CategoryController.js` are re-export stubs; `AggregateController.js` cleaned up (not split into module) |
| `middleware/` | Cross-cutting: JWT auth, guest ID assignment, file upload |
| `Models/` | Mongoose schemas and pre-save hooks |
| `job/` | Cron tasks (overdue marking, streak reset) — mutate DB on a schedule |
| `shared/utils/` | Pure functions — `userFilter.js`, `deadlineUtils.js`, `cookieOptions.js`, `taskConstants.js` |
| `shared/services/` | Domain services with DB access — `streakService.js` (streak + badge logic) |
| `utils/` | Legacy — `notification.js` (incomplete, do not expand) |
| `test/` | Jest tests — `test/utils/` for unit tests of shared utilities |

---

## Known Issues

**Critical**
- `helperController.js:42` — `process.totalSteps` should be `progress.totalSteps`. Affects `processProgress` (called on every task update); silently produces wrong `allStepsCompleted`.

**High**
- `TagController.js` — `createTag`/`getTag` take no `(req,res)` and send no response; `POST /api/tags` hangs until client timeout.
- `utils/notification.js` — `checkDeadlinesAndNotify` never resolves; `getNotifications` destructures wrong. Reached only via `modules/task/controller.js` (`updatedTaskAttempt`).
- `modules/user/controller.js` (`refreshedToken`) — new access token `expiresIn: "10m"` but cookie `maxAge` 15m; token expires before cookie. Preserved verbatim during Phase 4.
- `modules/task/service.js` (`retryTask`) — calls `tryAgainTask`, not exported from `helperController.js`; throws at runtime. Pre-existing.
- `modules/task/controller.js` (`getTask`) — tag filter uses `new Types.ObjectId(tag)()` (spurious `()`); throws when a tag filter is applied. Pre-existing.

**Low**
- `Models/Notification.js` — field `createAt` (missing `d`); queries on `createdAt` miss it.
- `Models/TryAgainHistory.js:5` — deprecated `mongoose.Schema.ObjectId`; should be `…Schema.Types.ObjectId`.
- `Routes/notificationRoute.js` — auto-loaded but all handlers commented out; dead module loaded each start.
- `Models/LoginHistory.js` — written on every login, never read.
- `modules/task/service.js` (`createTask`) — inline progress normalisation diverges from `helperController.processProgress` and has a typo `step.lable`.

### Dead or Unused Files

| File | Status | Safe to delete? |
|------|--------|----------------|
| `controllers/TasksController.js`, `removeController.js`, `UserController.js` | Re-export stubs | Yes, once all importers point at the `modules/` path |
| `controllers/TagController.js` — `getTag` | Never imported | Yes |
| `controllers/TagController.js` — `createTag` | Wired to `POST /api/tags` but hangs | No — fix first |
| `utils/notification.js` — `checkDeadlinesAndNotify` | Incomplete, never called | UNKNOWN — in-progress work |
| `Routes/notificationRoute.js` | Handlers commented out, auto-loaded | No — changes route surface; needs a decision |
| `Models/LoginHistory.js` | Written, no read path | No — audit feature likely planned |
| `Models/TryAgainHistory.js` | No confirmed import | Verify with grep before touching |

---

## Risk Register

| File | Why risky | Test before touching |
|------|-----------|----------------------|
| `modules/task/service.js` | Core logic for all 8 task ops; calls `updateUserStreak` on completion | No integration tests — smoke-test every grouping mode + completion |
| `controllers/helperController.js` | Imported by task service, category/aggregate controllers, cron; owns `handleError`, `processProgress`, `processCategory`, `calculateProgress` | Unit-test `processProgress` first; line 42 bug means it's already broken for non-empty steps |
| `shared/services/streakService.js` | All streak + badge logic; called by task service + cron; hardcoded Bangkok TZ | Full `test/.test.js` must pass; test the midnight boundary |
| `middleware/authOptional.js` | Every route passes through it; silently downgrades to guest | Integration test 401 paths + the wrong-secret case |
| `server.js` | Auto-loads all Routes; inits cron; a startup error kills the server | Verify clean `npm run dev` after route/middleware changes |
| `job/cronJob.js` | Runs at midnight against all users; a bug resets every streak | Run `.test.js`; mock `Date.now()` at midnight boundary |
| `Config/db.js` | Wrong env silently points at a bad URI; server starts healthy, all DB calls fail | Confirm `MONGO_URI` before deploying; `/health` does not check DB |

---

## Do Not Touch

- `middleware/authOptional.js` — auth gateway for every route; no integration tests.
- `job/` — cron timing depends on timezone + `Date.now()` mocking; needs controlled time fixtures.

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

### Silent failure patterns
- `authOptional.js` catches all JWT errors and continues as guest — bad secret, expired, and tampered tokens all look identical; no distinguishing log.
- `Config/db.js` logs a connection error but does not exit or set a health flag; `/health` returns 200 even when MongoDB is unreachable.

### Timezone edge cases in streak logic
- `updateUserStreak` converts dates to `"Asia/Bangkok"` (UTC+7). The cron reset runs at midnight server time — if the server isn't UTC+7, reset and streak calc use different day boundaries.
- `differenceInDays` is time-component sensitive; both dates pass through `startOfDay` before the diff — keep that if the TZ conversion changes.
- The `dayDifference === 0` (same-day) branch does not update `lastCompleted`; a completion just after Bangkok midnight while `lastCompleted` is the prior calendar day can double-increment the streak.

---

## Migration status

Phase 4 complete — all modules extracted (`task/`, `user/`, `category/`, `auth/`); `AggregateController.js` cleaned up; `TASK_STATUSES`/`STATUS_ORDER`/`PRIORITY_ORDER` extracted to `shared/utils/taskConstants.js`. All success criteria met.
Full phase history and bug post-mortems: **`server/MIGRATION.md`**.

---

