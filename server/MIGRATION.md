# server/MIGRATION.md

Backend refactor history and bug post-mortems. Evergreen guidance lives in `server/CLAUDE.md`.

---

## Refactoring goal

Split fat legacy controllers into the 3-layer module pattern
(`modules/<domain>/{controller,service,repository}.js`), extract shared utilities, and remove
duplicated logic — without breaking the 25-test suite.

### Problems found

**Functions >100 lines**

| Function | Original location | Lines | Status |
|----------|-------------------|-------|--------|
| `getTask` | `controllers/TasksController.js:30` | 296 | ✅ Split — controller ~55 lines, logic in service methods |
| `createTask` | `controllers/TasksController.js:328` | 134 | ✅ Split — controller ~20 lines, logic in `service.createTask` |
| `updatedTask` | `controllers/TasksController.js:464` | 114 | ✅ Split — controller ~20 lines, logic in `service.updateTask` |
| `getTasksCompletedRateByCategory` | `controllers/AggregateController.js:69` | 107 | ✅ Duplicate `$lookup` removed; replaced first lookup + `$cond/$size` with `$ifNull` in `$group._id` |
| `updateUserStreak` | `controllers/helperController.js:89` | 104 | ✅ Moved to `shared/services/streakService.js` |

**Duplicated logic**

| Pattern | Status |
|---------|--------|
| `formatUser` + `userFilter` block (11 locations) | ✅ `buildUserFilter` utility; used in `modules/task/`, `modules/user/`, `modules/category/`, `AggregateController.js` |
| Cookie options object `{ httpOnly, secure, sameSite }` (5+ locations) | ✅ Extracted to `shared/utils/cookieOptions.js`; wired into `modules/user/controller.js`; `samesite` typo fixed |
| `["pending", "completed", "failed"]` status enum (3 locations) | ⬜ Not yet extracted |
| Progress percentage calculation (2 locations) | ✅ `AggregateController.getProgressStepRate` now uses `calculateProgress` from helperController |

---

## Phases

**Phase 1 — Shared utils** ✅
- [x] `buildUserFilter` → `shared/utils/userFilter.js`
- [x] `getTaskDeadlineRange` → `shared/utils/deadlineUtils.js` (fixes `"nextMonth"` label bug)
- [x] Cookie options factory → `shared/utils/cookieOptions.js` (fixed live `samesite` typo) — done in Phase 4
- [x] `TASK_STATUSES`, `STATUS_ORDER`, `PRIORITY_ORDER` → `shared/utils/taskConstants.js`; wired into `modules/task/service.js`, `modules/task/controller.js`, `Models/Tasks.js` schema enum. Replaced all three inline `["pending","completed","failed"]` arrays. 25/25 tests green.
- [x] Remove duplicate `calculateProgress` in `AggregateController.js:getProgressStepRate` — now uses `helperController.calculateProgress`

**Phase 2 — Streak service** ✅
- [x] Extract `updateUserStreak` + `calculateBadge` → `shared/services/streakService.js`
- [x] Export `calculateBadge` (was an unexported private function)
- [x] Update `helperController.js` and `cronJob.js` to import from `streakService.js`
- [x] Move Bangkok timezone constant (`STREAK_TIMEZONE`) to `streakService.js`

**Phase 3 — Task module** ✅
- [x] Split `getTask` 5 modes into `service.getTasksFlat`, `getTasksGroupedByStatus`, `getTasksGroupedByCategory`, `getTasksGroupedByDeadline`
- [x] Move `removeTask` + `removeAllCompletedTask` from `removeController.js` into task module
- [x] Extract DB calls into `modules/task/repository.js`
- [x] Wire `buildUserFilter` into all task handlers
- [x] `TasksController.js` and `removeController.js` reduced to re-export stubs

**Phase 4 — Remaining modules** ✅
- [x] `user/` module: `UserController.js` → `modules/user/` (fixed `samesite` typo + `cookieOptions` utility during extraction). 5 handlers split across controller/service/repository; `UserController.js` reduced to re-export stub; `Routes/auth.js` points at `modules/user/controller`. 25/25 tests green; register/login smoke test passed with correct Set-Cookie headers.
- [x] `category/` module: `CategoryController.js` → `modules/category/` (fixed `removedCategory` bug: `isValidObjectId(req.user)` → `buildUserFilter` which uses `req.user.id`; `CategoryController.js` reduced to re-export stub). 25/25 tests green.
- [x] `auth/` module: `modules/auth/index.js` created — `signAccessToken`, `signRefreshToken`, `verifyRefreshToken` (moved from `user/service.js`); `setAuthCookies`, `setAccessCookie`, `clearAuthCookies`, `clearAccessCookie` (moved from `user/controller.js`). `user/service.js` no longer imports `jsonwebtoken` directly. 25/25 tests green.
- [x] `AggregateController.js` — duplicate `$lookup` removed (replaced with `$ifNull` in `$group._id`); `buildUserFilter` wired into all three handlers; `calculateProgress` used in `getProgressStepRate`; `req.query.id` → `req.params.id` bug fixed; `handleError` used consistently. 25/25 tests green.

### Architecture status tree

```
modules/
  task/               ← COMPLETE ✅
  user/               ← COMPLETE ✅ (Phase 4)  controller uses cookieOptions; service handles register/login/refresh/getUserData
  category/           ← COMPLETE ✅ (Phase 4)  bug fix: removedCategory ownership filter now uses buildUserFilter
  auth/               ← COMPLETE ✅ (Phase 4)  token signing + cookie helpers; user/service.js no longer imports jwt directly
shared/
  utils/userFilter.js     ← COMPLETE ✅ buildUserFilter(req)
  utils/deadlineUtils.js  ← COMPLETE ✅ getTaskDeadlineRange(deadline)
  utils/cookieOptions.js  ← COMPLETE ✅ cookieOptions({ maxAge, path })
  services/streakService.js ← COMPLETE ✅ updateUserStreak, calculateBadge, STREAK_TIMEZONE
controllers/          ← legacy
  helperController.js     ← shared utilities (handleError, processProgress, calculateProgress)
  TasksController.js      ← re-export stub → modules/task/controller
  removeController.js     ← re-export stub → modules/task/controller
  UserController.js       ← re-export stub → modules/user/controller
  CategoryController.js   ← re-export stub → modules/category/controller
  AggregateController.js  ← cleaned up: buildUserFilter + calculateProgress wired; duplicate $lookup removed
```

---

## Bug post-mortems

### Post-Phase 4 — MongoDB connection string ✅ COMPLETE
- Fixed MongoDB connection string. Root cause: switched from `mongodb+srv://` to the standard
  multi-host connection string format.

### Post-Phase 5 — Login "User found: No" / MONGO_URI undefined ✅ COMPLETE (smoke test passed)

Three layered bugs.

**Problem 1 — Wrong database name in URI.** `server/.env` connection strings had no database name
(e.g. `…27017/?ssl=…`), so Mongoose defaulted to the `test` database. The user document lived in
`Timebackend` (local) or `mydatabase` (Atlas). `User.findOne()` searched the wrong DB → null.
Fix: split into `server/.env.development` (Atlas `slimelist-dev`) and `server/.env.production`
(Atlas `slimelist`). Removed the old tracked `server/.env` with `git rm -f`. Added `server/.env`
and `server/.env.*` to `.gitignore`.

**Problem 2a — dotenv loaded after local module imports.** `require("dotenv").config()` sat on
line 18 of `server.js`, after `require("./Config/db")` and `require("./job/cronJob")`. Modules
reading env at load time saw undefined. Fix: moved dotenv to line 1, before all other requires;
switched to `path.join(__dirname, \`.env.${NODE_ENV}\`)`.

**Problem 2b — Windows cmd trailing-space bug (root cause of MONGO_URI undefined).**
`"dev": "set NODE_ENV=development && nodemon server.js"` — Windows cmd includes the space before
`&&` in the value, producing `NODE_ENV = "development "`. The dotenv path became `.env.development `
(non-existent); dotenv fails silently → MONGO_URI undefined. Diagnostic clue: the log showed
`"development  environment"` with two spaces. Fix: removed spaces before `&&` in `dev`, `dev:local`,
`start`; added `.trim()` to the NODE_ENV value in `server.js`.

**Credential rotation (this session).** `server/.env` had been git-tracked with plaintext
credentials. Rotated `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` (new 64-byte hex), and the
MongoDB Atlas `slimeUser` password (Atlas UI). Both env files updated.
⚠️ Old credentials remain in git history — scrub with `git filter-repo`/BFG before any public exposure.

**Files changed (Post-Phase 5):** `server/server.js`, `server/Config/db.js`, `server/package.json`,
`server/.env.development` (new), `server/.env.production` (new), root `.gitignore`.

---

## Success criteria

- [x] `streakService` functions testable with a plain object — no Mongoose mock required
- [x] `getTaskDeadlineRange` extracted as a named pure function — unit-testable, bug fixed
- [x] `buildUserFilter` utility created and used in all converted modules + AggregateController
- [x] `npm test` passes after every phase (25/25)
- [x] All cookie options flow from `cookieOptions()` — `samesite` typo impossible to reintroduce
- [x] No controller function >50 lines (task, user, category done; AggregateController cleaned up)
- [x] Zero duplicate `userFilter` logic — all handlers use `buildUserFilter`
- [x] `TASK_STATUSES` defined once — model schema, service, and controller all import from `shared/utils/taskConstants.js`

---

## Checkpoint process

After each phase: run `npm test`, list what passed and what broke. Do **not** start Phase N+1
until all Phase N tests pass.

---
## [NEW TASK] Refactoring Template (For Claude's Reference)
### Refactoring Goal / Objective
- [Briefly state what we are trying to achieve in this session]

### Active Phases
#### Phase X — [Phase Title] ⏳ (or ✅ when passed)
- **Files Changed**: `path/to/file1.js`, `path/to/file2.jsx`
- **Test Command**: `npm test`
- **Test Results**: X passed, Y failed (Include specific logs if something broke)
- **Status**: [Pending / Fixed]

### Post-Mortem & Verified Fixes
- **[Issue Name]**: [What went wrong and how we fixed it]
