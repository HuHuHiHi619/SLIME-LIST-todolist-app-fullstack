# BACKLOG — SlimeList single source of truth

**Updated:** 2026-06-07 · **Branch:** main

The **one** live backlog for SlimeList — **open work only**. Finished work lives in
[`.claude/history/COMPLETED-2026-06.md`](.claude/history/COMPLETED-2026-06.md).
Don't re-add closed items here.

**Workflow (root `CLAUDE.md`):** Plan Mode first → confirm before editing → sequential phases →
update the relevant `MIGRATION.md` at each phase end → one workspace at a time. Run `/scrutinize`
on any fix plan before coding (standing memory).

---

## Protected / risky files — touch only inside their own phase, smoke-test manually

- `frontend/src/Config/axiosConfig.js` — no tests cover the interceptor
- `frontend/src/redux/taskSlice.jsx` — no open items
- `frontend/src/components/pages/hooks/usePopup.jsx` — no open items
- `frontend/src/components/pages/create/CreateTask.jsx` — no open items
- `server/modules/task/service.js` — no integration tests (see `server/backend.md` §Risk Register)

---

## Backend — open issues

- **BE #1** `Models/Notification.js` — field is `createAt` (missing `d`); any query on `createdAt` silently misses it. Low severity, no active feature reads notifications yet.
- **BE #2** `Routes/notificationRoute.js` — auto-loaded at every server start with all handlers commented out. Dead module; safe to delete once confirmed no future use.
- **BE #3** `Models/LoginHistory.js` — written on every login, never read by any route or service. Leave if an audit feature is planned; otherwise delete.
- **BE #4** `modules/task/service.js` (`createTask`) — inline progress normalisation has typo `step.lable` (missing `b`) and diverges from `helperController.processProgress`. Steps on tasks created via this path may not match the format used elsewhere.
- **BE #5** `controllers/TasksController.js`, `removeController.js`, `UserController.js` — re-export stubs only. Safe to delete once all importers point at `modules/` paths directly.

---

## Frontend — open items

- **FE #1** "Try Again" UI still in the codebase — `taskDetail.jsx:188` button, its thunk, and API fn were not removed when the backend deleted `PUT /user/:id/attempt` (now 404s). Remove in its own frontend phase.
- **FE #2** `src/Config/axiosConfig.js` — 401 refresh-queue interceptor has no automated tests. A regression (retry loop or premature logout) surfaces only at runtime.

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
