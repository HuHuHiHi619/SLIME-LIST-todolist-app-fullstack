# server-patterns

Reference for the established patterns in this Express backend. Everything documented here is sourced from existing code — do not invent patterns not listed.

---

## 1. Module Structure

Each domain lives in `modules/<domain>/` with exactly three layers:

```
modules/<domain>/
  controller.js   ← parse req → call buildUserFilter → delegate to service → send res
  service.js      ← business logic only; throws ServiceError for 4xx; no req/res objects
  repository.js   ← Mongoose calls only; returns docs or lean arrays; no logic
```

**Controller responsibilities** (`modules/task/controller.js` is the reference):
- Call `buildUserFilter(req)` at the top of every handler
- Guard `if (!userFilter) return res.status(401)...` before any DB access
- Delegate all business logic to service; never write Mongoose queries here
- Catch ServiceError via `sendServiceError(res, error)`, then fall back to `handleError`

**Service responsibilities** (`modules/task/service.js`):
- Own all business rules (validation, date checks, ownership checks)
- `throw new ServiceError(message, statusCode)` for expected 4xx conditions
- Call repository functions; never import `req` or `res`

**Repository responsibilities** (`modules/task/repository.js`):
- Thin Mongoose wrappers — `Tasks.find()`, `Tasks.findOne()`, `Tasks.findOneAndUpdate()`, etc.
- Return raw docs or lean arrays; no transformation, no business logic

`modules/auth/` is a shared helper module (no controller/service/repository split) — it owns JWT signing and auth cookie helpers consumed by `modules/user/`.

---

## 2. ServiceError Pattern

**Definition** (copy into each new module's `service.js`):
```js
class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ServiceError";
  }
}
```

**Throwing** (in service.js):
```js
throw new ServiceError("Task not found", 404);
throw new ServiceError("Title and start date are required"); // defaults to 400
```

**Catching** (controller.js pattern):
```js
const sendServiceError = (res, error) => {
  if (error.name === "ServiceError") {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return null; // caller should invoke handleError
};

// in handler catch block:
return sendServiceError(res, error) || handleError(res, error, "Failed to ...");
```

Export `ServiceError` from service.js so the controller can reference it:
```js
module.exports = { ..., ServiceError };
const { ServiceError } = taskService; // in controller.js
```

---

## 3. buildUserFilter

**Source**: `shared/utils/userFilter.js`

**Import**:
```js
const { buildUserFilter } = require("../../shared/utils/userFilter");
```

**Usage**:
```js
const { formatUser, userFilter } = buildUserFilter(req);
```

**Return values**:
| Value | Type | Meaning |
|-------|------|---------|
| `formatUser` | `ObjectId` | JWT-authenticated user ID |
| `formatUser` | `null` | Guest or unauthenticated |
| `userFilter` | `{ user: ObjectId }` | Ownership filter for registered user |
| `userFilter` | `{ guestId: string }` | Ownership filter for guest |
| `userFilter` | `null` | Neither identity present — no DB query allowed |

**Critical rule**: Always guard against null userFilter before issuing any DB query:
```js
if (!userFilter) return res.status(401).json({ error: "Unauthorized" });
```
Passing `{}` to `Tasks.find()` matches every document in the collection — `null` is intentional and must not be replaced with an empty object.

---

## 4. Known Issues — Do Not Call Directly

These functions have confirmed bugs. Do not add new call sites. Existing call sites are preserved verbatim.

| File | Function | Issue |
|------|----------|-------|
| `utils/notification.js` | `checkDeadlinesAndNotify` | Never resolves — hangs any caller |
| `utils/notification.js` | `getNotifications` | Destructures wrong field — throws at runtime |
| `controllers/helperController.js` | `processProgress` | Line 42: `process.totalSteps` should be `progress.totalSteps`; silently produces wrong `allStepsCompleted` |
| `controllers/TagController.js` | `createTag`, `getTag` | No `(req, res)` params, sends no response — `POST /api/tags` hangs until client timeout |
| `modules/task/service.js` | `retryTask` | Calls `tryAgainTask` which is not exported from helperController — throws at runtime |
| `modules/task/controller.js` | `getTask` (tag filter) | `new Types.ObjectId(t)()` — spurious `()` causes throw when tag filter is applied |

---

## 5. Dead / Unused Files — Do Not Import

| File | Reason |
|------|--------|
| `utils/notification.js` | Incomplete in-progress work — do not expand or add callers |
