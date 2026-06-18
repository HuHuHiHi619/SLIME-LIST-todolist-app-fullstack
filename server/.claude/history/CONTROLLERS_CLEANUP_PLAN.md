# Controllers Cleanup Plan

## Context

`server/controllers/` has three files in different states of decay:

1. **`CategoryController.js`** — dead backward-compat stub; `categoryRoutes.js` already imports from `modules/category/controller` directly. Zero importers.
2. **`helperController.js`** — misnamed utility file. Three live functions (`handleError`, `processProgress`, `calculateProgress`) used across modules; three exports are dead (`processCategory` never called, `updateUserStreak`/`calculateBadge` re-exports that nothing imports from here).
3. **`AggregateController.js`** — real live controller with three summary handlers, stranded outside the module pattern. Hits MongoDB directly with no repository layer. Its routes (`/summary/*`) are bolted onto `taskRoutes.js` even though they're a separate domain.

**Scrutiny fixes applied:**
- Phase order corrected: summary module created (Phase 2) before helperController dissolved (Phase 3). Avoids updating AggregateController imports only to delete the file immediately after.
- `npm test` won't catch broken route imports (Jest never boots the server). Explicit `node -e "require(...)"` checks added to Phase 2 and Phase 3 checkpoints.
- `getProgressStepAggregate` renamed to `findTaskForProgress` (it's `findOne`, not an aggregate pipeline).

---

## Target Layout

```
server/
  shared/
    errors.js           ← add handleError here (alongside ServiceError + sendServiceError)
    utils/
      progressUtils.js  ← NEW: processProgress + calculateProgress
  modules/
    summary/
      controller.js     ← NEW: 3 handlers moved from AggregateController
      repository.js     ← NEW: DB queries extracted from controller
  Routes/
    summaryRoutes.js    ← NEW: /summary/* routes (auto-loaded by server.js readdirSync)
    taskRoutes.js       ← Edit: remove /summary/* routes + AggregateController import
  controllers/          ← deleted (empty after all three phases)
```

---

## Phase 1 — Delete `CategoryController.js`

Zero callers. Safe to delete immediately.

**Checkpoint:** `npm test` — green.

---

## Phase 2 — Create `modules/summary/` (replaces AggregateController)

### 2a — `modules/summary/repository.js`

Extract the three DB calls from `AggregateController.js`. The two aggregate pipelines move verbatim; `Tasks.findOne` is named accurately:

```js
const Tasks = require("../../Models/Tasks");

const getCompletedRateAggregate = (userFilter) => Tasks.aggregate([/* verbatim pipeline */]);
const getCompletedRateByCategoryAggregate = (userFilter) => Tasks.aggregate([/* verbatim pipeline */]);
const findTaskForProgress = (formatId, userFilter) =>
  Tasks.findOne({ _id: formatId, ...userFilter });  // returns Mongoose doc (not .lean()) — controller calls .toObject()

module.exports = { getCompletedRateAggregate, getCompletedRateByCategoryAggregate, findTaskForProgress };
```

### 2b — `modules/summary/controller.js`

Same logic as `AggregateController.js`, updated imports:

```js
const { isValidObjectId, Types } = require("mongoose");
const { buildUserFilter } = require("../../shared/utils/userFilter");
const { handleError } = require("../../controllers/helperController");   // ← still valid in this phase
const { calculateProgress } = require("../../controllers/helperController");
const repository = require("./repository");

exports.getTasksCompletedRate = ...
exports.getTasksCompletedRateByCategory = ...
exports.getProgressStepRate = ...
```

> Note: summary/controller.js temporarily imports from `helperController` — these are updated to `shared/` in Phase 3 when helperController is dissolved. This avoids a circular dependency between phases.

### 2c — `Routes/summaryRoutes.js`

```js
const express = require("express");
const router = express.Router();
const { getTasksCompletedRate, getTasksCompletedRateByCategory, getProgressStepRate } =
  require("../modules/summary/controller");
const guestMiddleware = require("../middleware/guestId");
const authMiddlewareOptional = require("../middleware/authOptional");

router.get("/summary/completed-rate", authMiddlewareOptional(true), guestMiddleware, getTasksCompletedRate);
router.get("/summary/completed-rate-by-category", authMiddlewareOptional(true), guestMiddleware, getTasksCompletedRateByCategory);
router.get("/summary/progress-rate/:id", authMiddlewareOptional(true), guestMiddleware, getProgressStepRate);

module.exports = router;
```

> `server.js` uses `readdirSync("./Routes")` — new file is auto-loaded, no `server.js` change needed.

### 2d — Clean `taskRoutes.js`

Remove the three `/summary/*` route definitions and the `AggregateController` import line.

### 2e — Delete `controllers/AggregateController.js`

**Checkpoint:**
```bash
npm test                                              # 64 tests green
node -e "require('./Routes/summaryRoutes'); console.log('ok')"
node -e "require('./Routes/taskRoutes'); console.log('ok')"
```

---

## Phase 3 — Dissolve `helperController.js` into `shared/`

### 3a — Add `handleError` to `shared/errors.js`

Append to existing exports:

```js
const handleError = (res, error, message = "Server Error", statusCode = 500) => {
  console.error(`Error: ${message}`, error);
  res.status(statusCode).json({ error: message });
};

module.exports = { ServiceError, sendServiceError, handleError };
```

### 3b — Create `shared/utils/progressUtils.js`

Move `processProgress` and `calculateProgress` verbatim from `helperController.js`:

```js
const processProgress = (progress) => { ... };
const calculateProgress = (task) => { ... };
module.exports = { processProgress, calculateProgress };
```

### 3c — Update all importers

| File | Old import | New import |
|---|---|---|
| `modules/task/controller.js` | `handleError` from `../../controllers/helperController` | `../../shared/errors` |
| `modules/category/controller.js` | `handleError` from `../../controllers/helperController` | `../../shared/errors` |
| `modules/user/controller.js` | `handleError` from `../../controllers/helperController` | `../../shared/errors` |
| `modules/task/service.js` | `processProgress, calculateProgress` from `../../controllers/helperController` | `../../shared/utils/progressUtils` |
| `modules/summary/controller.js` | `handleError, calculateProgress` from `../../controllers/helperController` | `../../shared/errors` + `../../shared/utils/progressUtils` |

### 3d — Delete `helperController.js` and empty `controllers/` directory

Dead exports silently dropped: `processCategory`, `updateUserStreak`, `calculateBadge`.

**Checkpoint:**
```bash
npm test                                              # 64 tests green
node -e "require('./modules/summary/controller'); console.log('ok')"
node -e "require('./modules/task/controller'); console.log('ok')"
node -e "require('./modules/user/controller'); console.log('ok')"
node -e "require('./modules/category/controller'); console.log('ok')"
```

---

## Files Changed Summary

| File | Action |
|---|---|
| `controllers/CategoryController.js` | **Delete** |
| `controllers/AggregateController.js` | **Delete** |
| `controllers/helperController.js` | **Delete** |
| `controllers/` directory | **Delete** (empty) |
| `shared/errors.js` | Edit — add `handleError` |
| `shared/utils/progressUtils.js` | **Create** — `processProgress` + `calculateProgress` |
| `modules/summary/repository.js` | **Create** |
| `modules/summary/controller.js` | **Create** |
| `Routes/summaryRoutes.js` | **Create** |
| `Routes/taskRoutes.js` | Edit — remove `/summary/*` routes + AggregateController import |
| `modules/task/controller.js` | Edit — update `handleError` import |
| `modules/task/service.js` | Edit — update `processProgress`/`calculateProgress` import |
| `modules/category/controller.js` | Edit — update `handleError` import |
| `modules/user/controller.js` | Edit — update `handleError` import |
| `modules/summary/controller.js` | Edit (Phase 3) — update `helperController` imports to `shared/` |
