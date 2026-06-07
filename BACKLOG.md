# BACKLOG — SlimeList single source of truth

**Updated:** 2026-06-07 · **Branch:** fix/auth-middleware-cleanup

The **one** live backlog for SlimeList — **open work only**. Finished work lives in
[`.claude/history/COMPLETED-2026-06.md`](.claude/history/COMPLETED-2026-06.md).
Don't re-add closed items here.

**Workflow (root `CLAUDE.md`):** Plan Mode first → confirm before editing → sequential phases →
update the relevant `MIGRATION.md` at each phase end → one workspace at a time. Run `/scrutinize`
on any fix plan before coding (standing memory).

---

## Protected / risky files — touch only inside their own phase, smoke-test manually

- `frontend/src/Config/axiosConfig.js` — interceptor now has tests; still no integration tests for the full auth cookie flow
- `frontend/src/redux/taskSlice.jsx` — no open items
- `frontend/src/components/pages/hooks/usePopup.jsx` — no open items
- `frontend/src/components/pages/create/CreateTask.jsx` — no open items
- `server/modules/task/service.js` — no integration tests (see `server/backend.md` §Risk Register)

---

## Backend — open issues

### Auth middleware cleanup (`server/middleware/`) — branch `fix/auth-middleware-cleanup`

Issues found in `authOptional.js` and `guestId.js`. Scrutinized 2026-06-07 — see refined scope below.

**Commit plan (safest order):**
- **Commit A1:** BE-MW-1 (trivial delete — proves baseline tests still pass)
- **Commit A2:** BE-MW-2 + test fix (structural, test update required)
- **Commit A3:** BE-MW-4 (error handling only)
- **Commit B:** BE-MW-5 + BE-MW-6 (`guestId.js` session)
- **Commit C:** BE-MW-7 (log sweep, both files)

**Items:**

- **#BE-MW-1** `authOptional.js` lines 21 & 39 — dead string literals `// --- ... ---\n");` (leftover from stripped `console.log` calls). Delete both lines. *(trivial)*
- **#BE-MW-2** `authOptional.js` duplicates guestId cookie logic (lines 17–19): reads `req.cookies.guestId` and sets `req.guestId` directly. Middleware stack order is already verified (`authOptional → guestMiddleware` in all route files). Remove the duplication — `authOptional` should only set `req.user`. **Must also update `auth.middleware.test.js:25-33`**: that test asserts `req.guestId` after calling `authOptional` in isolation; fix it by either chaining `guestMiddleware` in the test or dropping the `req.guestId` assertion and covering it in a separate `guestMiddleware` test. *(medium)*
- **#BE-MW-3** ~~Silent pass-through when `allowGuest=false`~~ — **closed, not a real risk.** `getUserData` (`user/controller.js:141`) already guards `if (!req.user || !req.user.id) → 401`. `logout` (`user/controller.js:98`) intentionally ignores `req.user` — unauthenticated logout clears cookies and returns 200, which is correct. Controllers already own the auth enforcement. No code change needed.
- **#BE-MW-4** `authOptional.js` over-aggressive cookie clear (lines 44–51): clears `accessToken` on *any* JWT error. Narrow to `TokenExpiredError` only — other errors (wrong secret, malformed) should log and return 401 without wiping the cookie. *(low)*
- **#BE-MW-5** `guestId.js` no UUID validation on incoming cookie (lines 9–11): accepts raw cookie string as `req.guestId`. Add `validate` from the `uuid` package; treat invalid values as absent and generate a fresh ID. *(low — prevents spoofed values reaching DB queries)*
- **#BE-MW-6** `guestId.js` ordering dependency: add a **runtime assertion** (`if (req.user === undefined) return next(new Error('guestMiddleware must run after an auth middleware'))`) instead of a comment — a comment won't catch a future route that skips the auth middleware. *(low)*
- **#BE-MW-7** Both files: `console.log` on every code path (12 calls total). Remove or gate behind `NODE_ENV !== 'production'`. Do as a final sweep after logic is settled. *(low — noise reduction)*

---

## Frontend — open items

---

## Housekeeping / parked

- **#22** One orphan guest task `PASS-create-*` left in **dev** Atlas from a verify run (guest cookie gone, not deletable via UI). Harmless; drop it next time you're in dev Atlas.
- **Prod data (parked from P0):** prod Atlas `slimelist` is completely empty. If real prod users/tasks were ever expected, the data is not where `.env.production`'s `MONGO_URI` points — chase before trusting prod.
- **Dependabot:** GitHub reports vulnerabilities on the default branch — separate track, not triaged.
- **Lint not green repo-wide:** `react/prop-types` fails across prop-taking components (e.g. `PublicRoute.jsx`) because `prop-types` was never installed. `npm run lint` is already non-green — install `prop-types` + annotate, or disable the rule in eslint config, before letting lint gate CI.

---

## Not yet audited (frontend)

Most of `components/pages/ui/`, `animation/`, `user/` (`Home`, `AllTask`, `Upcoming`, `Category`,
`Sidebar`, `Navbar`, date pickers, `ProgressField`, `Summary`). A full audit should cover these.

---

## Suggested skills / tooling
`/scrutinize` (before any fix plan) · `/diagnose` (trace-before-fix) · `/verify` (run the app after a change) ·
`/tdd` (Vitest/Jest regressions) · `/code-review` before committing a phase ·
`server-patterns` skill before editing backend modules.

## Related (reference, don't duplicate)
Completed work: [`.claude/history/COMPLETED-2026-06.md`](.claude/history/COMPLETED-2026-06.md) ·
Backend refactor history: [`.claude/history/BE_MIGRATION.md`](.claude/history/BE_MIGRATION.md) ·
Architecture: `frontend/frontend.md`, `server/backend.md`, root `CLAUDE.md` ·
Phase history: `frontend/MIGRATION.md`, `server/MIGRATION.md` ·
Memory: `~/.claude/.../memory/MEMORY.md`
