# Category Module Refactor Plan

> Pattern: mirrors task + user module refactors

## Context

`server/modules/category/service.js` (60 lines) has three problems beyond the duplicate `ServiceError`:

1. **Service takes raw `req`** — all three functions accept the Express Request object and call `buildUserFilter(req)` internally. Services should be framework-agnostic; controllers should extract data and pass plain values.
2. **Dead validation throw** — `createCategory` throws if `!categoryName`; Zod covers this at the controller boundary.
3. **Debug `console.log` noise** — two stray logs.

`controller.js` (39 lines) passes `req` straight through and has no validation layer. The `getCategory` handler returns HTTP 201 for an empty list (wrong — 201 means Created).

**Scrutiny fixes applied:**
- All controller handlers keep try/catch + sendServiceError + handleError (plan pseudocode made this explicit).
- ID validation for GET moves to the controller (consistent with DELETE) — service no longer needs the isValidObjectId guard.
- Dead `!formatId` guard removed from service.removeCategory (controller validates before the call).
- `ServiceError` dropped from service.js exports (nothing imports it from there).

---

## Target Layout

```
server/modules/category/
  controller.js   ← HTTP layer (Zod wired, ID/auth guards, buildUserFilter moved here)
  service.js      ← business logic (req-free, plain args)
  repository.js   ← DB layer (no changes)
  schema.js       ← NEW: CreateCategorySchema
  helpers.js      ← NEW: ServiceError
```

---

## Phase 1 — Extract helpers.js

**Create `server/modules/category/helpers.js`** — export `ServiceError`.

**Update `service.js`:** Remove `ServiceError` class definition, import from `./helpers`.

> `controller.js` uses duck-typing (`error.name === "ServiceError"`) — no import needed there.

**Checkpoint:** `npm test` — green.

---

## Phase 2 — Decouple service from req, add schema, wire Zod

### 2a — `server/modules/category/schema.js`

```js
const { z } = require("zod");

const CreateCategorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
});

module.exports = { CreateCategorySchema };
```

### 2b — Rewrite `service.js`

All three functions take plain data. ID validation is gone (controller owns it). Dead throw and console.logs removed. `buildUserFilter` import removed.

```js
const { Types } = require("mongoose");
const repository = require("./repository");
const { ServiceError } = require("./helpers");

const getCategories = async (userFilter) => {
  return repository.findCategories(userFilter);
};

const createCategory = async ({ categoryName, formatUser, guestId }) => {
  return repository.insertCategory({
    categoryName,
    user: formatUser,
    guestId: formatUser ? null : guestId,
  });
};

const removeCategory = async (formatId, userFilter) => {
  const removed = await repository.deleteCategory({ _id: formatId, ...userFilter });
  if (!removed) throw new ServiceError("Category not found");
  return removed;
};

module.exports = { getCategories, createCategory, removeCategory };
```

### 2c — Rewrite `controller.js`

Controller owns: auth guard, ID validation (both GET and DELETE), Zod validation, `buildUserFilter` call. All handlers keep try/catch. Fix 201→200 for empty list.

```js
const { isValidObjectId, Types } = require("mongoose");
const { handleError } = require("../../controllers/helperController");
const { buildUserFilter } = require("../../shared/utils/userFilter");
const categoryService = require("./service");
const { CreateCategorySchema } = require("./schema");

const sendServiceError = (res, error) => {
  if (error.name === "ServiceError") {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return null;
};

exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { userFilter } = buildUserFilter(req);
    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
    if (id) {
      if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid category ID" });
      userFilter._id = new Types.ObjectId(id);
    }
    const categoryList = await categoryService.getCategories(userFilter);
    return res.status(200).json(categoryList);          // fixed: was 201 for empty
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error, "Failed to get category");
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { formatUser, userFilter } = buildUserFilter(req);
    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
    const parsed = CreateCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const saved = await categoryService.createCategory({
      categoryName: parsed.data.categoryName,
      formatUser,
      guestId: req.guestId,
    });
    return res.status(200).json(saved);
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error, "Failed to create category");
  }
};

exports.removedCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { userFilter } = buildUserFilter(req);
    const formatId = isValidObjectId(id) ? new Types.ObjectId(id) : null;
    if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
    if (!formatId) return res.status(400).json({ error: "Invalid category ID" });
    const removed = await categoryService.removeCategory(formatId, userFilter);
    return res.status(200).json({ message: "Remove category succesful", removedCategory: removed });
  } catch (error) {
    if (sendServiceError(res, error)) return;
    handleError(res, error, "Cannot remove category");
  }
};
```

**Checkpoint:** `npm test` — green.

---

## Phase 3 — Add tests

**Create `server/test/category/categorySchema.test.js`:**

```js
// CreateCategorySchema
// - empty body {} → fails "Category name is required"
// - { categoryName: "" } → fails (min 1)
// - { categoryName: "Work" } → success
// - extra unknown fields → still succeeds (Zod strips by default)
```

**Checkpoint:** `npm test` — all green.
Target count: 60 existing + ~4 new = ~64 tests.

---

## Files Changed Summary

| File | Action |
|---|---|
| `server/modules/category/helpers.js` | **Create** — ServiceError |
| `server/modules/category/schema.js` | **Create** — CreateCategorySchema |
| `server/modules/category/service.js` | Edit — remove req coupling, dead throw, console.logs; plain args |
| `server/modules/category/controller.js` | Edit — Zod, ID guards, buildUserFilter, fix 201→200 |
| `server/modules/category/repository.js` | No change |
| `server/test/category/categorySchema.test.js` | **Create** |

---

## Verification

```bash
cd server && npm test   # after each phase
```

Manual smoke tests after Phase 2:
- `POST /api/categories` with `{}` → `400 { error: "Category name is required" }`
- `POST /api/categories` with `{ categoryName: "Work" }` → `200`
- `GET /api/categories` → `200` even when list is empty (was 201 before)
- `DELETE /api/categories/badid` → `400 { error: "Invalid category ID" }`
