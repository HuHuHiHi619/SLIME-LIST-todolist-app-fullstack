# Task Module Refactor Plan

> Pattern blueprint: `server/.claude/MODULE_REFACTOR_BLUEPRINT.md`
> Branch: `refactor/task-module-cleanup`

## Context

`server/modules/task/service.js` (337 lines) does four jobs: input validation, data transformation, business logic, and grouping/sorting. Goal: split into focused single-responsibility files, add Zod at the controller boundary for HTTP validation, and produce a reusable pattern for other modules.

---

## Target Layout

```
server/modules/task/
  controller.js   ← HTTP layer only (already mostly clean)
  service.js      ← business logic only (thinned)
  repository.js   ← DB layer (no changes needed)
  schema.js       ← NEW: Zod schemas for req.body validation
  helpers.js      ← NEW: ServiceError, compareTasksForFlatList, lookupCategoryByName + cache
```

---

## Prerequisite

Zod is not yet in `server/package.json`. Install before starting:

```bash
cd server && npm install zod
```

---

## Phase 1 — Extract helpers.js

**What moves out of `service.js`:**
- `ServiceError` class
- `compareTasksForFlatList` function
- `_categoryCache` Map + `CATEGORY_CACHE_TTL` constant + `lookupCategoryByName` function

**Create `server/modules/task/helpers.js`** — export all three.

**Update imports in these files:**

| File | Change |
|---|---|
| `service.js` | Import `ServiceError`, `compareTasksForFlatList`, `lookupCategoryByName` from `./helpers` |
| `controller.js` | Import `ServiceError` from `./helpers` instead of from `taskService` |
| `server/test/task/flatSort.test.js` | Line 1: change `../../modules/task/service` → `../../modules/task/helpers` |

> **Note:** Test file is at `server/test/task/flatSort.test.js` (inside `task/` subdirectory).

**Checkpoint:** `npm test` — all existing tests green before proceeding.

---

## Phase 2 — Create schema.js + wire into controller + remove dead service validation

### 2a — New file: `server/modules/task/schema.js`

```js
const { z } = require("zod");

const ProgressStepSchema = z.object({
  label: z.string(),
  completed: z.boolean().optional(),
});

const ProgressSchema = z.object({
  steps: z.array(ProgressStepSchema),
}).optional();

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  note: z.string().optional(),
  startDate: z.string().min(1),     // date parsing (parseISO/isValid) stays in service
  deadline: z.string().optional(),
  category: z.string().optional(),
  progress: ProgressSchema,
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  note: z.string().optional(),
  startDate: z.string().optional(),
  deadline: z.string().nullable().optional(),   // null = remove deadline
  category: z.string().nullable().optional(),   // null = remove category
  progress: ProgressSchema,
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
});

module.exports = { CreateTaskSchema, UpdateTaskSchema };
```

### 2b — Wire into `controller.js`

Add Zod validation before every service call that reads `req.body`:

```js
const { CreateTaskSchema, UpdateTaskSchema } = require("./schema");

// in createTask handler:
const parsed = CreateTaskSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
// pass parsed.data to service

// in updatedTask handler:
const parsed = UpdateTaskSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
```

### 2c — Remove from `service.js` (now covered by Zod)

| Location | Line(s) | What to remove |
|---|---|---|
| `createTask` | ~172 | `if (!title \|\| !startDate) throw new ServiceError(...)` |
| `updateTask` | ~254–256 | `if (!PRIORITIES.includes(final.priority)) throw new ServiceError(...)` |
| `updateTask` | ~262–264 | `if (final.status && !TASK_STATUSES.includes(final.status)) throw new ServiceError(...)` |

**Keep in `service.js`** (business rules, not HTTP shape validation):
- `parseISO` / `isValid` date parsing — converts string → Date object, catches malformed dates
- `startDate > deadline` ordering check
- start date in past check
- category lookup failure (`Category not found` ServiceError)
- task not found (404 ServiceError)

> **Priority default stays**: `service.js` line ~217 has `priority: PRIORITIES.includes(priority) ? priority : "low"`.
> This is a **defaulting ternary**, not a validation throw — do NOT remove it. Zod passes `undefined` for
> optional fields; the ternary normalizes `undefined → "low"` before writing to DB.

**Checkpoint:** `npm test` — green. Manual test: POST `/api/task` with no body → 400.

---

## Phase 3 — Clean up `service.js` imports

After Phase 2, update the import block at the top of `service.js`:

```js
// Remove from service.js top-level (these now live in helpers.js):
//   ServiceError class definition
//   compareTasksForFlatList function definition
//   _categoryCache, CATEGORY_CACHE_TTL, lookupCategoryByName

// Add:
const { ServiceError, compareTasksForFlatList, lookupCategoryByName } = require("./helpers");
```

No logic changes in this phase — imports only.

**Checkpoint:** `npm test` — green.

---

## Phase 4 — Update/add tests

**Update `server/test/task/flatSort.test.js`:**
- Already handled in Phase 1 — import path updated to `./helpers`

**Create `server/test/task/taskSchema.test.js`** — integration-style tests that call the controller function directly with a mock `res`, not just Zod schema unit tests:

```js
// Confirm bad req.body is rejected with 400 before service is ever called
// - POST createTask with no title → 400, service not called
// - POST createTask with priority: "URGENT" → 400
// - POST createTask with valid minimal body → service called (not 400)
// - PUT updateTask with status: "invalid" → 400
// - PUT updateTask with empty body {} → service called (all fields optional)
```

**Checkpoint:** `npm test` — all tests green.
Target count: 25 existing + ~5 new = ~30 tests.

---

## Files Changed Summary

| File | Action |
|---|---|
| `server/modules/task/helpers.js` | **Create** |
| `server/modules/task/schema.js` | **Create** |
| `server/modules/task/service.js` | Edit — remove 3 throws, update imports |
| `server/modules/task/controller.js` | Edit — add Zod wiring, fix ServiceError import |
| `server/modules/task/repository.js` | No change |
| `server/test/task/flatSort.test.js` | Edit — update import path (Phase 1) |
| `server/test/task/taskSchema.test.js` | **Create** |
| `server/package.json` | Add `zod` dependency |

---

## Verification

```bash
cd server
npm install        # picks up zod
npm test           # run after each phase — must stay green
```

Manual smoke tests after Phase 2:
- `POST /api/task` with empty body → `400 { error: { fieldErrors: { title: [...], startDate: [...] } } }`
- `POST /api/task` with `{ priority: "URGENT" }` → `400`
- `POST /api/task` with valid body → `201` (existing behavior unchanged)
- `PUT /api/task/:id` with `{ deadline: null }` → `200` (null is valid for UpdateTaskSchema)
