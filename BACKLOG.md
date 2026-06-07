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
- `frontend/src/components/pages/hooks/usePopup.jsx` — P7 ✅ done; no open items
- `frontend/src/components/pages/create/CreateTask.jsx` — open: BL #19, BL #20, BL #24
- `server/modules/task/service.js` — no integration tests (see `server/backend.md` §Risk Register)

---

## Planned — designs ready, pick order next session

### P7 — Popup mutation consistency ✅ DONE (2026-06-07) *(closed BL #26 + BL #20 usePopup half)*

Shipped Option A (pessimistic everywhere) in `usePopup.jsx` + `taskSlice.jsx`. Fixed the category-delete
contradiction (optimistic-no-rollback vs. the P4 #2 toast) by moving removal into
`removedCategory.fulfilled` (filter by `action.meta.arg`); deleted the dead `removeCategories` reducer;
kept the `try/catch` blocks (dropped only the `console.error` noise); removed the 100ms `setTimeout`.
86/86 unit tests pass incl. 2 new regression tests. GUI smoke not run (no browser driver in-env).
Details in `frontend/MIGRATION.md` → "P7". **Remaining BL #20 piece:** `CreateTask.jsx:113` 300ms
timer (protected, own phase).

<details><summary>original plan (kept for reference)</summary>

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

</details>

---

## Quality / lower severity (frontend audit) — open

- **#5** `userSlice.jsx:134-139` — `fetchUserData.fulfilled` hardcodes `isGuest=false`; guest detection relies on backend *rejecting* for guests. Confirm vs `/user/profile`.
- **#6** `userSlice.jsx:27,144` — `initialState={...defaultState}` shallow → `userData` shares ref with `defaultState`. Latent shared-mutation footgun.
- **#7** `taskSlice.jsx:192,358` *(protected)* — `writeStreakStatus()` (localStorage) called inside reducers; move to thunk/middleware.
- **#8** `authen.js:11-13` — `register` writes token to `localStorage` but app is cookie-based; `userLogin` doesn't. Dead/inconsistent.
- **#9** ✅ **DONE (2026-06-07).** Stripped all reachable debug `console.log` calls across `taskSlice`, `task.js`, `authen.js`, `category.js`, `userSlice.jsx`, `CreateEntity.jsx`, `usePopup.jsx`, `Settings.jsx`, `GroupTaskForm.jsx`, `taskDetail.jsx`. `axiosConfig.js` and `CreateTask.jsx:110-124` left intact (protected). No `console.error` catches touched.
- **#10** `functions/task.js:86` (and `:133`) — `completeTask`/sibling return `{ _id: taskId, ...response.data }`; server `_id` overrides `taskId`. Two endpoints, same pattern.
- **#17** ✅ **DONE (2026-06-07).** Changed `useEffect` dep from `[selectedTask]` → `[selectedTask?._id]`; syncs only on task-open, not on own-save returning. Stale closure eliminated. 2 regression tests added.
- **#19** `CreateTask.jsx:41-43` *(protected)* — `validator` dispatches `startDate` then reads it stale same-render; redundant (line 107 has `||` fallback).
- **#20** Magic `setTimeout` for summary refetch. `usePopup.jsx` 100ms — ✅ **DONE** (P7, 2026-06-07, now awaits directly). `CreateTask.jsx:113` 300ms — still open (*protected*, own phase).
- **#21** ✅ **DONE (2026-06-07).** Chose *strip*: removed `loading` from `taskSlice` `initialState` + 12 thunk writes (it was write-only — no component selected it). `userSlice`/`summarySlice` `loading` left intact (those are consumed). Details in `frontend/MIGRATION.md` → "Frontend hygiene".
- **#24** `StartDatePicker` defaults empty `selected` to `new Date()` (stores `<day>T<now-time>Z`) while `DeadlinePicker` defaults to `null` (clean local-midnight). The calendar **day** round-trips fine, so low severity — just a time-component inconsistency. Fix: normalize startDate to local midnight, or default the picker's empty `selected` to `null`. Lives in `CreateTask.jsx` (*protected*).

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
