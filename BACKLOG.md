# BACKLOG — SlimeList single source of truth

**Updated:** 2026-06-07 · **Branch:** main

The **one** live backlog for SlimeList — **open work only**. Finished work has been lifted out to
[`.claude/history/COMPLETED-2026-06.md`](.claude/history/COMPLETED-2026-06.md) (a plain-language report
of everything done so far). Don't re-add closed items here.

**Workflow (root `CLAUDE.md`):** Plan Mode first → confirm before editing → sequential phases →
update the relevant `MIGRATION.md` at each phase end → one workspace at a time. Run `/scrutinize`
on any fix plan before coding (standing memory).

---

## Protected / risky files — touch only inside their own phase, smoke-test manually

- `frontend/src/Config/axiosConfig.js`
- `frontend/src/redux/taskSlice.jsx` — open: BL #7
- `frontend/src/components/pages/hooks/usePopup.jsx` — open: P7, BL #20
- `frontend/src/components/pages/create/CreateTask.jsx` — open: BL #19, BL #20, BL #24
- `server/modules/task/service.js` — no integration tests (see `server/backend.md` §Risk Register)

---

## Planned — designs ready, pick order next session

### P7 — Popup mutation consistency *(absorbs BL #26)*

**Problem.** The five popup/sidebar mutation handlers in `usePopup.jsx` follow **three different
patterns** for the same shape of operation:
- `handleCompletedTask` (`:65`) — await thunk, then `setTimeout(100ms)` → refetch summary + userData (BL #20 magic delay).
- `handleRemovedTask` (`:80`) / `handleRemovedAllTask` (`:90`) — await thunk, then `await fetchSummary()`. Pessimistic, clean.
- `handleRemovedItem` category (`:99`) — **optimistic** `removeCategories(id)` *before* the awaited
  `removedCategory(id)`, **no rollback**. On failure the category is already gone from the UI while the
  new P4 #2 toast shows an error → contradictory state until refetch.

Only one of five is optimistic, and it's the one that can't undo itself. Every `catch` is a bare
`console.error` (now redundant with the toast).

**Decision needed:** pick ONE house pattern for all popup mutations.
- **Option A — pessimistic everywhere (recommended).** Drop the optimistic `removeCategories` from
  `handleRemovedItem`; await `removedCategory` *then* let the fulfilled reducer / refetch remove it (same
  as `handleRemovedTask`). Simplest, consistent, no rollback code, and the toast already covers failure.
  Fits the "keep core simple" product direction. ~1 file, low risk.
- **Option B — optimistic + rollback everywhere.** Snappier UX but every delete needs a captured-prev +
  re-insert-on-catch. More surface, more state. Only worth it if delete latency is actually felt.
- Either way: delete the bare `console.error` catches (toast surfaces the error) and resolve BL #20 (await
  the summary refetch directly instead of `setTimeout(100ms)` / `300ms`).

**Scope:** `usePopup.jsx` (not protected) + possibly `CreateTask.jsx:113` (300ms timer, *protected* — own
phase). Add a Vitest for the chosen behavior. Closes BL #26 + folds in BL #20.

### P8 — App-level error boundary

**Why.** The P4 #2/#21 toast crash (a bad selector hit `undefined`) white-screened the **entire app** for
every user, because React has no default error boundary — any throw in render unmounts the whole tree.
This was the *second* selector-key footgun in this area; the next one will do the same. A boundary turns
"blank app" into a recoverable fallback.

**Plan.**
1. Self-roll `components/ErrorBoundary.jsx` — a class component (`getDerivedStateFromError` +
   `componentDidCatch`) rendering a branded fallback ("Something went wrong — reload"). No new dependency
   (mirror the self-rolled `TaskErrorToast` choice; avoid `react-error-boundary` per product direction).
2. Wrap the route tree in `App.jsx` — inside `AuthProvider`, around `<BrowserRouter>` (covers both
   `TaskErrorToast` and routes). Consider a reset keyed on `location.pathname` so navigating away clears it.
3. Log the caught error to console (leave a hook for future telemetry).
4. **Verify by regression:** temporarily reintroduce a bad selector → confirm the fallback renders, not a
   blank page (exactly what would have caught the #21 crash pre-merge).

**Scope:** new file + a few lines in `App.jsx` (not protected). Low risk, high blast-radius protection.

---

## Quality / lower severity (frontend audit) — open

- **#5** `userSlice.jsx:134-139` — `fetchUserData.fulfilled` hardcodes `isGuest=false`; guest detection relies on backend *rejecting* for guests. Confirm vs `/user/profile`.
- **#6** `userSlice.jsx:27,144` — `initialState={...defaultState}` shallow → `userData` shares ref with `defaultState`. Latent shared-mutation footgun.
- **#7** `taskSlice.jsx:192,358` *(protected)* — `writeStreakStatus()` (localStorage) called inside reducers; move to thunk/middleware.
- **#8** `authen.js:11-13` — `register` writes token to `localStorage` but app is cookie-based; `userLogin` doesn't. Dead/inconsistent.
- **#9** Production `console.log` noise across `taskSlice`, `authen.js`, `task.js`, `category.js`, `summary.js`.
- **#10** `task.js:85` — `completeTask` returns `{ _id: taskId, ...response.data }`; server `_id` overrides `taskId`.
- **#17** `taskDetail.jsx:49-53` — sync effect guards on `isUpdating` but omits it from deps → stale closure can clobber in-progress edits.
- **#19** `CreateTask.jsx:41-43` *(protected)* — `validator` dispatches `startDate` then reads it stale same-render; redundant (line 107 has `||` fallback).
- **#20** Magic `setTimeout` for summary refetch: `usePopup.jsx:78` (100ms), `CreateTask.jsx:113` (300ms). Should await directly. *(Folded into P7.)*
- **#21** `state.tasks.loading` is written by every task thunk but **no component renders it** — dead UI state. The error half is done (P4 #2 toast); `loading` still has no surface. Wire a task-loading spinner (create/fetch flows have none) or strip the flag — decide before adding more `loading` bookkeeping.
- **#24** `StartDatePicker` defaults empty `selected` to `new Date()` (stores `<day>T<now-time>Z`) while `DeadlinePicker` defaults to `null` (clean local-midnight). The calendar **day** round-trips fine, so low severity — just a time-component inconsistency. Fix: normalize startDate to local midnight, or default the picker's empty `selected` to `null`. Lives in `CreateTask.jsx` (*protected*).

---

## Housekeeping / parked

- **#22** One orphan guest task `PASS-create-*` left in **dev** Atlas from a verify run (guest cookie gone, not deletable via UI). Harmless; drop it next time you're in dev Atlas.
- **Prod data (parked from P0):** prod Atlas `slimelist` is completely empty. If real prod users/tasks were ever expected, the data is not where `.env.production`'s `MONGO_URI` points — chase before trusting prod.
- **Dependabot:** GitHub reports vulnerabilities on the default branch — separate track, not triaged.

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
