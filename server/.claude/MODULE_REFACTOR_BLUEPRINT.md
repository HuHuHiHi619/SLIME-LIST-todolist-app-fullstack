# Module Refactor Blueprint

Source of truth for refactoring any `server/modules/<module>/` from the old overloaded pattern to the clean layered pattern. Decisions locked via grill session on 2026-06-08, validated against the `task` module first.

---

## Decisions

| Concern | Decision | Reason |
|---|---|---|
| Language | Stay in **JS** | Frontend is also JS; TS migration adds build overhead across a JS-only monorepo |
| Focus | **Code complexity**, not performance | No observed perf issues; `.lean()` already applied in repository |
| Validation library | **Zod** at controller boundary only | Validates `req.body` before hitting service; service keeps `ServiceError` for internal contract |
| Structure | **5-file split** per module | See target layout below |
| Workflow | **Green tests at every step** | JS has no compile-time safety net; tests are the refactor safety net |
| Scope | **One module at a time** | Prove pattern in `task` first, then replicate mechanically |

---

## Target File Layout

```
server/modules/<module>/
  controller.js   ← HTTP layer: parse req, run Zod schema, call service, send res
  service.js      ← Business logic only: orchestrates repo + helpers, throws ServiceError
  repository.js   ← DB layer: thin Mongoose wrappers, always .lean() on list queries
  schema.js       ← Zod schemas for request bodies (CreateXSchema, UpdateXSchema, etc.)
  helpers.js      ← ServiceError class, pure utility functions, in-memory caches
```

---

## Layer Responsibilities

### controller.js
- Parse `req.params`, `req.query`, `req.body`
- Validate `req.body` with Zod schema — return 400 on failure before calling service
- Call service, map `ServiceError` to HTTP response
- No business logic

### service.js
- Receive already-validated data from controller
- Enforce business rules (throw `ServiceError` for violations)
- Call repository for DB operations
- Call helpers for lookups and utilities
- No Mongoose, no `req`/`res`

### repository.js
- One Mongoose call per function
- Always `.lean()` on list queries (`find`)
- `findOne` without `.lean()` only when caller needs to call `.save()` (e.g. toggle)
- No business logic

### schema.js
- Zod schemas only
- Export named schemas: `CreateXSchema`, `UpdateXSchema`
- Used exclusively by `controller.js`

### helpers.js
- `ServiceError` class (message + statusCode)
- Pure sort/comparison functions
- In-memory caches with TTL (Map + expiry timestamp pattern)
- No DB calls, no HTTP concerns

---

## Phased Workflow (per module)

**Phase 1 — Extract helpers.js**
Move `ServiceError`, sort/compare functions, and any in-memory cache + lookup functions out of `service.js` into `helpers.js`. Fix all imports. Run `npm test` → must be green before proceeding.

**Phase 2 — Create schema.js (Zod)**
Write `CreateXSchema` and `UpdateXSchema` covering all `req.body` fields. Wire into `controller.js` to validate before calling service. Remove the duplicate manual field checks from `service.js` that are now covered by Zod. Run `npm test` → green.

**Phase 3 — Thin service.js**
After Zod handles input shape, service only enforces business rules (date ordering, entity existence, status transitions). Remove any validation that duplicates what Zod now guarantees. Run `npm test` → green.

**Phase 4 — Update/add tests**
Add controller-layer tests covering Zod rejection (malformed body → 400). Confirm all existing tests still pass. Update `MIGRATION.md` for the module.

---

## Zod Schema Patterns

```js
// schema.js
const { z } = require("zod");

const CreateXSchema = z.object({
  title: z.string().min(1),
  // add fields here
});

const UpdateXSchema = CreateXSchema.partial();  // all fields optional for PATCH/PUT

module.exports = { CreateXSchema, UpdateXSchema };
```

```js
// controller.js — validation usage
const { CreateXSchema } = require("./schema");

exports.createX = async (req, res) => {
  const parsed = CreateXSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  // parsed.data is clean — pass to service
};
```

---

## ServiceError Pattern (helpers.js)

```js
class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ServiceError";
  }
}
```

Controller maps it:
```js
if (error.name === "ServiceError") {
  return res.status(error.statusCode).json({ error: error.message });
}
```

---

## What NOT to Change

- Repository query strategy — `.lean()` is already applied; aggregation pipelines add complexity without measured benefit at current scale
- `ServiceError` contract — keep it internal to service; don't replace with Zod inside service
- Test behavior — refactor must not change observable behavior; tests are the proof
