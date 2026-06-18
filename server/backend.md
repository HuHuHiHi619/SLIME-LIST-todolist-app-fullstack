# server/CLAUDE.md

Express backend for SlimeList. Supplements the root CLAUDE.md.

---

## Stack & Commands

Node + Express + Mongoose (MongoDB Atlas). Zod for HTTP validation. Jest for tests.

```bash
npm run dev        # nodemon on :5000  (sets NODE_ENV=development)
npm run dev:local  # dev with USE_LOCAL_DB=true
npm start          # production (sets NODE_ENV=production)
npm test           # Jest, 10s timeout — 93 tests across 11 suites
```

---

## Architecture

### The Module Pattern (use for all new domains)

```
modules/<domain>/
  controller.js   ← Zod validation, buildUserFilter, parse req, call service, send res
  service.js      ← business logic; throws ServiceError for 4xx; no req/res
  repository.js   ← Mongoose calls only; returns docs or lean arrays
  schema.js       ← Zod schemas for req.body validation (controller boundary only)
  helpers.js      ← domain-specific pure functions and constants
```

`ServiceError`, `sendServiceError`, and `handleError` live in `shared/errors.js`. All modules import from there.
`modules/auth/` is a shared helper module (no controller/service/repository split) — JWT signing and cookie helpers consumed by `modules/user/`.

### Auth model

Dual-mode: registered users carry a JWT (`req.user`); guests carry a `guestId` cookie.
Every route passes through `middleware/authOptional.js`, which silently downgrades any auth failure to guest.
`buildUserFilter(req)` (`shared/utils/userFilter.js`) resolves identity into the Mongoose ownership filter.

**Identity field:** `req.user.id` (not `._id`) — set by JWT decode in `authOptional.js`. Always use `formatUser` from `buildUserFilter` — never `req.user?._id`.

### Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/tasks` | GET/POST/PUT/DELETE | optional+guest | Task CRUD |
| `/api/category` | GET/POST/PUT/DELETE | optional+guest | Category management |
| `/api/summary/*` | GET | optional+guest | Dashboard analytics |
| `/api/pet` | GET | optional+guest | Fetch pet state |
| `/api/pet/pomodoro` | POST | optional+guest | Award pomodoro reward (60s cooldown; 429 on violation) |

### Pet Module (`modules/pet/`)

| File | Responsibility |
|------|---------------|
| `helpers.js` | Constants: `EXP_REWARDS`, `HAPPINESS_REWARDS`, `POMODORO_EXP=20`, `POMODORO_HAPPINESS=5`, `POMODORO_COOLDOWN_MS=60000`. Pure fns: `applyExp`, `calcEvolutionStage`, `getStreakMultiplier` |
| `service.js` | `awardTaskReward(pet, priority, streak)`, `awardPomodoroReward(pet, streak)` — update exp, happiness, evolutionStage; return updated doc |
| `repository.js` | `findOrCreatePet(filter)` — upsert by userId or guestId |
| `controller.js` | `getPet` (GET), `completePomodoro` (POST — enforces cooldown via `lastPomodoroAt`) |

**Evolution gates** (from `calcEvolutionStage`):

| Stage | Requires |
|-------|---------|
| egg | default |
| baby | level ≥ 5 |
| teen | level ≥ 15 AND happiness ≥ 50 |
| adult | level ≥ 30 AND happiness ≥ 80 |

**EXP formula:** Level N costs `(N+1) * 100` EXP to complete.
**Streak multiplier:** ≥3 days → 1.05×; ≥7 → 1.10×; ≥14 → 1.15×; ≥30 → 1.20×.
**Happy buff:** happiness > 71 → 1.2× EXP multiplier on top of streak multiplier.

### Folder Map

| Folder | Responsibility |
|--------|---------------|
| `Config/` | MongoDB connection |
| `Routes/` | URL-to-handler wiring only |
| `Models/` | Mongoose schemas: Task, User, Category, Notification, Pet |
| `modules/task/` | 3-layer + schema.js + helpers.js (ServiceError, compareTasksForFlatList, lookupCategoryByName) |
| `modules/user/` | 3-layer + schema.js (RegisterSchema, LoginSchema) |
| `modules/category/` | 3-layer + schema.js |
| `modules/summary/` | controller + repository — dashboard aggregates |
| `modules/pet/` | 3-layer + helpers.js (EXP/happiness constants and pure reward logic) |
| `modules/auth/` | Token signing + cookie helpers — used by `modules/user/` |
| `middleware/` | authOptional, guestId, upload |
| `job/cronJob.js` | Nightly: mark overdue tasks, reset broken streaks, decay pet happiness, zero `pomodorosToday` |
| `shared/errors.js` | ServiceError, sendServiceError, handleError |
| `shared/utils/` | userFilter.js, deadlineUtils.js, cookieOptions.js, taskConstants.js, progressUtils.js |
| `shared/services/` | streakService.js (streak logic — badge system removed) |
| `test/` | Jest tests: `test/utils/`, `test/task/`, `test/user/`, `test/category/`, `test/pet/` |

---

## Known Issues

None open.

---

## Risk Register

| File | Why risky | Test before touching |
|------|-----------|----------------------|
| `modules/task/service.js` | Core logic for all task ops; calls `updateUserStreak` on completion | Smoke-test every grouping mode + completion |
| `shared/errors.js` | Imported by all controllers and services | Verify all modules still boot after any change |
| `shared/services/streakService.js` | All streak logic; called by task service + cron; Bangkok TZ hardcoded | Full test suite; test midnight boundary |
| `modules/pet/helpers.js` | Pure reward math — `applyExp`, `calcEvolutionStage` used by service | `npm test` — petHelpers.test.js covers all gates |
| `middleware/authOptional.js` | Every route passes through it | Integration test 401 paths |
| `server.js` | Auto-loads Routes via readdirSync; inits cron | Verify clean `npm run dev` after route changes |
| `job/cronJob.js` | Runs at midnight — resets streaks, decays happiness, zeros pomodorosToday | Mock `Date.now()` at midnight boundary |
| `Config/db.js` | Wrong env silently points at bad URI | Confirm `MONGO_URI` before deploying |

---

## Do Not Touch

- `middleware/authOptional.js` — auth gateway for every route; no integration tests.
- `job/` — cron timing depends on timezone + `Date.now()` mocking.
- `modules/auth/index.js` — JWT secrets read lazily; touching getter functions risks silent `undefined`-secret bugs.

---

## Development Gotchas

### Env var setup

| File | NODE_ENV | Database |
|------|----------|---------|
| `server/.env.development` | development | Atlas `slimelist-dev` |
| `server/.env.production` | production | Atlas `slimelist` |

`server.js` loads the right file at startup. npm scripts set `NODE_ENV` (**no space before `&&`**).

### Identity field gotcha
`authOptional.js` sets `req.user.id` (not `._id`). Always use `formatUser` / `buildUserFilter` — never access `req.user?._id` directly.

### Zod validation boundary
All HTTP body validation at the controller via `schema.js`. Zod errors returned as `{ error: firstIssue.message }`. Business-rule errors thrown in `service.js`.

### Pomodoro cooldown
`completePomodoro` checks `pet.lastPomodoroAt` — if within 60s, returns 429 with a cooldown message. The `pomodorosToday` counter is zeroed by the nightly cron.

### Silent failure patterns
- `authOptional.js` catches all JWT errors and continues as guest — bad secret, expired, and tampered tokens all look identical.
- `Config/db.js` logs a connection error but does not exit; `/health` returns 200 even when MongoDB is unreachable.

### Timezone edge cases in streak logic
- `updateUserStreak` converts dates to `"Asia/Bangkok"` (UTC+7). Cron runs at midnight server time — if server isn't UTC+7, reset and streak calc use different day boundaries.
- `differenceInDays` is time-component sensitive; both dates pass through `startOfDay` before the diff.
