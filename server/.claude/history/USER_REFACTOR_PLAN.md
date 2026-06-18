# User Module Refactor Plan

> Pattern: mirrors `server/REFACTOR_PLAN.md` (task module)

## Context

`server/modules/user/service.js` (87 lines) holds a duplicate `ServiceError` class and a dead validation throw that will be covered by Zod. `server/modules/user/controller.js` (148 lines) uses `express-validator` (via `validationResult`) for register/login validation — validation rules live in the router (`Routes/auth.js`), splitting concerns across two files. One additional bug exists: the register handler calls `upload(req, res, callback)` *inside* the handler body, but `upload` is already applied as route middleware — the inner call is dead and structurally broken (the try/catch runs outside its callback).

**Error format alignment:** The frontend (`frontend/src/functions/authen.js:13–17`) expects `resError.error` to be either a string or an array of `{ msg }` objects (express-validator shape). Zod's `flatten()` returns an object — `Array.isArray` returns false and the UI shows `[object Object]`. Fix: the controller emits `{ error: parsed.error.issues[0].message }` (first failing rule as a plain string), which the frontend's existing fallback path handles correctly without any frontend changes.

---

## Target Layout

```
server/modules/user/
  controller.js   ← HTTP layer only (Zod wired, express-validator removed, upload bug fixed)
  service.js      ← business logic only (1 dead throw removed)
  repository.js   ← DB layer (no changes)
  schema.js       ← NEW: Zod schemas for register + login
  helpers.js      ← NEW: ServiceError
```

---

## Phase 1 — Extract helpers.js

**What moves out of `service.js`:**
- `ServiceError` class

**Create `server/modules/user/helpers.js`** — export `ServiceError`.

**Update imports:**

| File | Change |
|---|---|
| `service.js` | Import `ServiceError` from `./helpers` instead of defining it |

> **Note:** `controller.js` does NOT import `ServiceError` — `sendServiceError` uses duck-typing (`error.name === "ServiceError"`). No controller change needed in this phase.

**Checkpoint:** `npm test` — all existing tests green before proceeding.

---

## Phase 2 — Create schema.js + wire into controller + remove dead validation

### 2a — New file: `server/modules/user/schema.js`

The frontend register form only sends `{ username, password }` — `theme`, `notification`, `lastCompleted` are never in the payload. Schema validates only what's actually sent; optional fields are kept for future use but not validated strictly.

```js
const { z } = require("zod");

const RegisterSchema = z.object({
  username: z
    .string()
    .min(6, "Username must be at least 6 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_.]+$/, "Username must contain only letters, numbers, underscores, or periods"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  theme: z.string().optional(),
  notification: z.boolean().optional(),
  lastCompleted: z.string().optional(),
});

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

module.exports = { RegisterSchema, LoginSchema };
```

### 2b — Wire into `controller.js`

**Error format:** Return `parsed.error.issues[0].message` (plain string) — matches the frontend's existing `throw new Error(resError?.error)` fallback without needing frontend changes.

```js
const { RegisterSchema, LoginSchema } = require("./schema");

// in register handler:
const parsed = RegisterSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
// pass parsed.data to service

// in login handler:
const parsed = LoginSchema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
```

**Fix the upload bug:** Remove the inner `upload(req, res, callback)` call from the register handler — `upload` is already applied as route middleware. Also remove `upload` from the import destructure (only `UPLOADS_DIR` is still needed):

```js
// Before:
const { upload, UPLOADS_DIR } = require("../../middleware/upload");

// After:
const { UPLOADS_DIR } = require("../../middleware/upload");
```

**Remove express-validator from controller.js:**
- Remove `const { validationResult } = require("express-validator");`
- Remove both `validationResult(req)` blocks

### 2c — Remove from `Routes/auth.js`

Remove the `body()` validator arrays from both `POST /register` and `POST /login` route definitions (validation now lives in the controller). Remove the `express-validator` import from the router.

```js
// Remove:
const { body } = require("express-validator");

// Simplified register route (upload middleware stays):
router.post("/register", upload, register);

// Simplified login route:
router.post("/login", login);
```

### 2d — Remove from `service.js`

| Location | What to remove |
|---|---|
| `registerUser` | `if (!password) throw new ServiceError("Password is required")` |

**Keep in `service.js`** (business rules, not HTTP shape validation):
- `if (existingUser) throw new ServiceError("User already exists")` — uniqueness check
- `if (!isMatch) throw new ServiceError("Invalid credentials")` — bcrypt compare
- `if (!user) throw new ServiceError(...)` — entity-not-found throws

### 2e — Uninstall express-validator

After the above changes, `express-validator` is unused across the entire project:

```bash
cd server && npm uninstall express-validator
```

**Checkpoint:** `npm test` — green. Manual test: `POST /api/register` with `{ username: "ab", password: "x" }` → `400 { error: "Username must be at least 6 characters" }`.

---

## Phase 3 — Add tests

**Create `server/test/user/userSchema.test.js`:**

```js
// RegisterSchema
// - missing username → 400 (first failing field message)
// - username too short (< 6 chars) → fails with correct message
// - username with invalid chars (e.g. "user!!") → fails
// - password too short (< 6 chars) → fails
// - valid { username: "validuser", password: "secret123" } → success

// LoginSchema
// - empty body → fails on username + password
// - valid body → success
```

**Checkpoint:** `npm test` — all tests green.
Target count: 50 existing + ~6 new = ~56 tests.

---

## Files Changed Summary

| File | Action |
|---|---|
| `server/modules/user/helpers.js` | **Create** — ServiceError |
| `server/modules/user/schema.js` | **Create** — RegisterSchema, LoginSchema |
| `server/modules/user/service.js` | Edit — remove 1 dead throw, import ServiceError from `./helpers` |
| `server/modules/user/controller.js` | Edit — Zod wiring, fix upload bug + import, remove express-validator |
| `server/Routes/auth.js` | Edit — remove body() validator arrays + express-validator import |
| `server/modules/user/repository.js` | No change |
| `server/test/user/userSchema.test.js` | **Create** |
| `server/package.json` | Remove `express-validator` dependency |

---

## Verification

```bash
cd server
npm test           # run after each phase — must stay green
```

Manual smoke tests after Phase 2:
- `POST /api/register` with `{}` → `400 { error: "Username must be at least 6 characters" }`
- `POST /api/register` with `{ username: "ab", password: "123456" }` → `400` (too short)
- `POST /api/register` with `{ username: "user!!", password: "123456" }` → `400` (invalid chars)
- `POST /api/login` with `{}` → `400 { error: "Username is required" }`
- `POST /api/login` with valid credentials → `200` (existing behavior unchanged)
