# BACKLOG — SlimeList single source of truth

**Updated:** 2026-06-06 · **Branch:** main

This is the **one** live backlog for SlimeList. It merges the former
`server/HANDOFF-bugfixes.md`, `server/cluster-b2-priority-migration-plan.md`, and
`frontend/HANDOFF.md` (now redirect stubs). Closed work lives in §Archive at the bottom;
everything above it is **open**.

**Workflow (root `CLAUDE.md`):** Plan Mode first → confirm before editing → sequential phases →
update the relevant `MIGRATION.md` at each phase end → one workspace at a time. Run `/scrutinize`
on any fix plan before coding (standing memory).

---

## Protected / risky files — touch only inside their own phase, smoke-test manually

- `frontend/src/Config/axiosConfig.js`
- `frontend/src/redux/taskSlice.jsx` — open bugs P4#2 (deferred), BL#7 (P1#1, P4#3 done)
- `frontend/src/components/pages/hooks/usePopup.jsx` — **has uncommitted changes**; bugs P3#14, BL#20
- `frontend/src/components/pages/create/CreateTask.jsx` — bugs BL#19, BL#20 (P1#11, P5#18, P6 done)
- `server/modules/task/service.js` — no integration tests (see `server/backend.md` §Risk Register)

## Intersections (why the order below is what it is)

1. ~~Priority picker (P6) + date bug P5#18 share `CreateTask.jsx`/`taskDetail.jsx`~~ — **done together
   2026-06-06** (see Archive). Remaining `CreateTask.jsx` items: BL#19, BL#20.
2. **P3#14 / P3#16** need caller tracing (`/diagnose`) before any edit — do not guess-fix.
3. Backend P0 is fully isolated — no frontend coupling, can run anytime.

---

## P0 — Backend · overdue cron fails east-of-UTC tasks one day early — DONE ✅ (branch `fix/backend-p0-25-overdue-cron-tz`)

**#25 — FIXED 2026-06-06.** Added `overdueThreshold`/`isOverdue` (pure, UTC-anchored, 1-day grace) to
`shared/utils/deadlineUtils.js`; `cronJob.js` query now `deadline: { $lt: overdueThreshold() }`. 24h grace
> 14h max TZ skew → **never fails any zone early** (verified +14 / −12 extremes); cost is east/UTC linger
~1 cron cycle (benign). Kept P5#18 as-is (user's call). No DB integration seam existed for the cron — the
fix is the seam: pure-function unit tests (`test/utils/deadlineUtils.test.js`, +5, **36/36 Jest**). Original
repro confirmed flipped (first fire `true→false`). Earlier detail below for reference:

**#25** `server/job/cronJob.js:15-33` `updateOverdueTasks`. **This is the cron interaction the P5#18
verify parked (was line 128).** Verified FAIL at runtime (TZ+7, the dev's own zone): P5#18's raw
local-instant convention pushes east-of-UTC deadlines *back* across the UTC-midnight line, so the
cron's strict `deadline: { $lt: currentDate }` — running **in UTC on Render**, `0 0 * * *` — marks
them `failed` **one full cron cycle (one calendar day) early**.

- **Evidence:** "due tomorrow (Jun 7)" picked in +7 → `toDayISO` stores `2026-06-06T17:00:00Z`. First
  fire `2026-06-07T00:00:00Z`: `17:00Z Jun 6 < 00:00Z Jun 7` → **failed at 07:00 Jun 7 Bangkok, the
  morning of the day it's due.** Pre-change storage (`2026-06-07T00:00:00Z`) survived to the next cycle.
- **Asymmetric:** positive (east) offsets regress; west-of-UTC unaffected (local midnight lands *after*
  UTC midnight). Live in prod — `server.js:52` calls `checkOverdueTasks()` at startup.
- **Two stacked layers:** (a) deadline stored as **start-of-day** midnight (pre-existing — even in pure
  UTC a "due Jun 7" task is overdue the instant Jun 7 begins); (b) P5#18's raw instant activated (a) for
  the most common real users. **Fix direction (not the revert):** cron should compare *calendar days* in
  a defined zone, or normalize stored deadlines to end-of-day. Isolated to `cronJob.js` — no frontend
  coupling. UI calendar-day round-trip is unaffected (P5#18's stated goal holds). Next: `/diagnose`.

## P1 — Frontend · critical logic bugs — ALL DONE ✅ (see Archive)

## P2 — Frontend · search field — DONE ✅ (see Archive)

## P3 — Frontend · trace before fixing (use `/diagnose`)

- **#14** — DONE ✅ (2026-06-06, see Archive). **Backlog was misdiagnosed** — not an inverted
  condition; it was dead code. Deleted.
- **#16** — DONE ✅ (2026-06-06, see Archive). **No live loop** (latent footgun); hardened the dep +
  removed dead `filterKey`. 69/69 Vitest (added 2 regression tests).

## P4 — Frontend · taskSlice mutation thunks *(protected)*

- **#2 — DEFERRED** (depends on the error-UI decision, see below). `taskSlice.jsx:121-167` —
  `updatedTask`, `completedTask`, `removedTask`, `removedAllTask`, `removedCategory` have no
  try/catch, no `rejectWithValue`, no `.rejected` handler → silent failures, `error` never set.
  **Scrutiny (2026-06-06):** the fix would write `state.task.error`, but **no component reads it**
  (grepped every `useSelector`) — same dead-state as **#21**, and all four call-site catch blocks
  already just `console.error(...)` without reading `.message`. So the fix is store-correctness only,
  zero user-facing change. **Bundle with #21**: settle the error/loading UI surface (toast/banner)
  first so `error` has a consumer, then wire `rejectWithValue` + `.rejected` with a real destination.
- **#3** — DONE ✅ (2026-06-06, see Archive). Reachable `null`→1970 bug confirmed at the call site.

## P5 — Frontend · date handling — DONE ✅ (see Archive)

- **#18** — DONE ✅ (2026-06-06). Unified both paths on the local-instant convention via shared
  `toDayISO`. Runtime `/verify` screenshots @ 390/768/1280 still pending.

## P6 — Feature · priority picker UI — DONE ✅ (see Archive)

Shipped a native-`<select>` `PriorityField` in `CreateTask.jsx` + `taskDetail.jsx`. Runtime `/verify`
(persist on create, autosave on edit) still pending.

## Backlog — quality / lower severity (frontend audit)

- **#5** `userSlice.jsx:134-139` — `fetchUserData.fulfilled` hardcodes `isGuest=false`; guest detection relies on backend *rejecting* for guests. Confirm vs `/user/profile`.
- **#6** `userSlice.jsx:27,144` — `initialState={...defaultState}` shallow → `userData` shares ref with `defaultState`. Latent shared-mutation footgun.
- **#7** `taskSlice.jsx:192,358` *(protected)* — `writeStreakStatus()` (localStorage) called inside reducers; move to thunk/middleware.
- **#8** `authen.js:11-13` — `register` writes token to `localStorage` but app is cookie-based; `userLogin` doesn't. Dead/inconsistent.
- **#9** Production `console.log` noise across `taskSlice`, `authen.js`, `task.js`, `category.js`, `summary.js`.
- **#10** `task.js:85` — `completeTask` returns `{ _id: taskId, ...response.data }`; server `_id` overrides `taskId`.
- **#17** `taskDetail.jsx:49-53` — sync effect guards on `isUpdating` but omits it from deps → stale closure can clobber in-progress edits.
- **#19** `CreateTask.jsx:41-43` *(protected)* — `validator` dispatches `startDate` then reads it stale same-render; redundant (line 107 has `||` fallback).
- **#20** Magic `setTimeout` sequencing for summary refetch: `usePopup.jsx:78` (100ms), `CreateTask.jsx:113` (300ms). Should await directly.
- **#23 — CLOSED ✅ (stale, not a bug).** 2026-06-06 `/scrutinize` during P5/P6 re-traced
  `taskDetail.jsx:25-47`: the `useRef(...)` **ends with `.current`** (line 47), so `debouncedUpdateTask`
  IS the debounced function and every call site (`.flush()` line 58; `debouncedUpdateTask(...)` at
  82/100/127/153/179) is correct. The autosave path works. The earlier "called without `.current`"
  note (and the P2 #13 self-correction) predate the `.current` now present in the file — nothing to fix.

- **#24** `StartDatePicker` defaults its empty `selected` to `new Date()` (with current time) while
  `DeadlinePicker` defaults to `null`. So a freshly-picked **startDate stores `<day>T<now-time>Z`**
  (e.g. `2026-07-10T13:44:10Z`) whereas a picked deadline stores clean local-midnight
  (`...T17:00:00Z`). Surfaced by the P5 #18 `/verify` run (2026-06-06). The calendar **day** round-trips
  correctly either way (P5 #18 holds), so this is low severity — just a time-component inconsistency
  between the two fields. Fix: normalize startDate to local midnight (or default the picker's empty
  `selected` to `null` like DeadlinePicker). Lives in `CreateTask.jsx` (*protected*).

### Findings from runtime verify session (2026-06-06, Playwright guest mode)

- **#21** `state.task.loading` is written by *every* task thunk (`pending`/`fulfilled`/`rejected`, incl. the
  P1 #1 fix) but **no component renders it** — only `state.user.loading` is consumed (`AuthForm.jsx`). It's
  dead UI state today. Either wire a task-loading spinner (the create/fetch flows have nothing) or strip the
  flag. Decide before adding more `loading` bookkeeping. *(Surfaced verifying #1 — its "stuck spinner" had no UI.)*
  **Bundle P4 #2 here:** `state.task.error` is the same dead read-side — decide one error/loading UI surface for both.
- **#22** Cleanup: one orphan guest task `PASS-create-*` left in **dev** Atlas from the verify run (guest cookie
  gone, so not deletable via UI). Harmless; drop it next time you're in dev Atlas.
- **Parked (from P0):** prod Atlas `slimelist` is completely empty. If real prod users/tasks were ever expected,
  the data is not where `.env.production`'s `MONGO_URI` points — chase before trusting prod.

## Not yet audited (frontend)

Most of `components/pages/ui/`, `animation/`, `user/` (`Home`, `AllTask`, `Upcoming`, `Category`,
`Sidebar`, `Navbar`, date pickers, `ProgressField`, `Summary`). A full audit should cover these.

---

## Archive — closed work (rationale kept for reference)

### P5 #18 + P6 — date unification + priority picker — DONE (2026-06-06, code + unit tests)
Bundled because both land in the same protected files (`CreateTask.jsx`, `taskDetail.jsx`). Full
detail in `frontend/MIGRATION.md`. **Runtime `/verify` @ 390/768/1280 still outstanding.**
- **#18 (date):** root cause was *divergence* — `CreateTask` hand-shifted the TZ offset (stored
  UTC-midnight of the picked day), `taskDetail` did raw `toISOString()` (local-midnight instant) → a
  task created then edited could jump a calendar day. Decision (user): **local-instant / raw ISO** —
  both pickers read back with `new Date(value)` in local time, so the raw instant round-trips to the
  same calendar day in the user's TZ for any offset. Extracted `toDayISO` (`functions/date.js`); both
  `handleDateChange` paths use it; CreateTask's offset math deleted. `toIsoDate` reducer guard (P4#3)
  left alone (separate concern).
- **#6 (picker):** `PriorityField` = styled **native `<select>`** (low|medium|high) — chosen over
  cloning `CategoryTagField`'s custom dropdown (that's for a *dynamic* list; priority is a fixed enum).
  No new wiring: `setFormTask` `...rest` carries it on create; the existing debounced `updatedTask` PUT
  carries it on edit; backend defaults `updateData.priority || existing.priority || "low"`.
- **Tests:** 78/78 (was 71; +4 date, +3 priority). **Lint:** only `PriorityField.jsx` adds entries,
  all in the baseline `React`-unused + `prop-types` classes shared by every sibling.
- **Cron note (verify):** RESOLVED → **confirmed a real bug, see P0 #25.** Raw ISO shifts the stored
  deadline instant by the TZ offset; the overdue cron compares instants in UTC and DOES prematurely fail
  east-of-UTC tasks by one calendar day.

### P4 #3 — `setFormTask` unsafe date coercion — DONE (2026-06-06, `/scrutinize`)
`setFormTask` guarded `new Date(value).toISOString()` only against `undefined`. Scrutiny traced the
call site and found the bug is **reachable**: `CreateTask.jsx:87` dispatches
`setFormTask({ deadline: null })` when the user clears the deadline → `new Date(null)` = epoch 0 →
deadline silently became `"1970-01-01T00:00:00.000Z"` instead of `null`. The invalid-string→`RangeError`
reducer crash was latent (every current caller passes `.toISOString()` output or `null`) but real.
Fix: extracted `toIsoDate(value, fallback)` — `undefined`→keep current, `null`→stay null, invalid→keep
current (no throw), valid→ISO. Used for both `startDate` and `deadline`. Added 2 regression tests
(clear→null; invalid→no-throw + prior value kept). **71/71 Vitest** (was 69), no new lint
(`taskSlice.jsx` + test file lint-clean; the 490 baseline errors are the pre-existing project-wide
`React`-unused set). **P4 #2 deferred** — see open P4 / #21 (dead `state.task.error`).

### P3 #16 — `useFetchTask` refetch dep + dead `filterKey` — DONE (2026-06-06, `/diagnose`)
**No live loop** — diagnosis: `fetchTasks.fulfilled` (`taskSlice.jsx:271-274`) doesn't bump
`lastStateUpdate` (only mutations do), and all 5 parent pages (`Home`/`AllTask`/`Upcoming`/`Category`/
`CategoryList`) carry no `useSelector`/local state, so they never re-render → the inline `filter={{...}}`
object stays referentially stable. The dep-array `filter` was a **latent footgun**: the day any parent
gains a redux subscription, the fresh-each-render object would cause a refetch on every render. `filterKey`
was dead end-to-end (no caller passes it to `TaskForm`; `useFetchTask` ignores a 2nd arg).
Fix: `useFetchTask` now deps on `JSON.stringify(filter)` (reference churn can't refetch; content change or
post-mutation `lastStateUpdate` still does); removed dead `filterKey` from `TaskForm`'s signature + the stray
2nd arg. Added `__tests__/hooks/useFetchTask.test.jsx` (new-but-equal object → no refetch; changed content →
refetch). 69/69 Vitest, no new lint (test file clean; `filter` prop-types + `React`-unused are pre-existing baseline).

### P3 #14 — `handleActiveMenu` dead code — DONE (2026-06-06, `/diagnose`)
**Backlog misdiagnosed it** as "condition inverted; clicking a new menu does nothing." Caller trace proved
otherwise: navigation runs through react-router `<Link to={to}>` (`SidebarLink.jsx:35`), and the active-pill
highlight from `activeMenu === to` is driven by `Sidebar.jsx:62` (`setActiveMenu(location.pathname)` effect) —
both already correct. `usePopup.handleActiveMenu` was invoked with **no argument** at all 5 Sidebar call sites
(`handleActiveMenu()`), so `menuName===undefined` and `if (activeMenu === menuName)` was never true → inert.
**Flipping the condition (the old prescription) would have broken nav** — it would run `navigate(undefined)` +
`setActiveMenu(undefined)`. Fix = deleted the dead function from `usePopup.jsx` (+ now-unused `useNavigate`,
`navigate`, `setActiveMenu`, `activeMenu`); simplified the 5 Sidebar wrappers to `handleActiveMenu={closeDrawerOnMobile}`
(the only live behavior was closing the mobile drawer). 67/67 Vitest, no new lint (only pre-existing `React`-unused baseline).

### P2 #12 + #13 — SearchField branch logic + debounce — DONE (2026-06-06)
Single file `SearchField.jsx`, not protected. 67/67 Vitest, no new lint.
- **#13** `debounceSearch` was rebuilt every render → debouncing never worked (one request per
  keystroke, leaked timers). Now `useRef(debounce(...)).current` — stable across renders; `dispatch`
  is redux-stable so captured once. Added `debounceSearch` to the cleanup-effect deps (now safe,
  silences exhaustive-deps). Chose `useRef` over `useMemo` (latter can be discarded → drops a pending
  500ms timer).
- **#12** Two separate `if`s collapsed to one chain: `if (!term) clear; else if (len <= 50) fetch;`.
  Fixes empty-term clear-then-`fetchSearchTasks("")` double-fire and the exactly-50-char no-op.
- Traced for scrutiny: store key `tasks` (selector at `:13` is correct); `searchedTask` returns
  `response.data.tasks`, always an array (success array + empty-term `{warning,tasks:[]}` both
  unwrap to an array) so `searchResults` stays array-safe. Backend caps at `>100` chars
  (`service.js:307`); frontend's `50` is arbitrary/stricter — left as-is (out of P2 scope).
- Spun off **BL #23** (broken `taskDetail.jsx` `useRef` debounce, called without `.current`).

### P0 — prod tag→priority migration — DONE (vacuous, 2026-06-06)
Dry-run against prod Atlas (`NODE_ENV=production`) connected to the correct DB (`databaseName === "slimelist"`,
the documented prod name) and found it **completely empty** — 0 users / 0 tasks / 0 tags / 0 categories.
Nothing to migrate; no live run performed (would scan 0 docs). **Not "applied" — vacuously satisfied.**
Open question parked: if prod was expected to hold real users/tasks, the data lives somewhere other than
what `.env.production`'s `MONGO_URI` points to — chase that before trusting prod.

### P1 #1 + #11 — create flow: stuck spinner + dead reset — DONE (2026-06-06)
- **#1** `taskSlice.jsx` `createNewTask.rejected` now sets `state.loading = false` (was only setting `error`,
  leaving the spinner stuck after a failed create — `.pending` sets `loading=true`).
- **#11** `CreateTask.jsx:128` `resetFormTask()` was a no-op (called without `dispatch`). Rather than wiring
  the dispatch, **deleted the line** — `createNewTask.fulfilled` already resets `formTask`+`progress`
  (slice:308-309) on the success path, so the call was redundant. Also removed the now-unused
  `resetFormTask` import. Verified: 67/67 Vitest, no new lint errors (CreateTask's React/prop-types
  warnings are pre-existing project-wide baseline).
- **Runtime verify (Playwright, guest mode, 2026-06-06):** happy path → task persists, modal closes,
  reopened form is empty (#11 reset proof). Forced-500 path → `createNewTask.rejected` fires
  ("Error creating task" logged), modal stays open, app stays usable. **Note:** no component reads
  `state.task.loading`, so #1's "stuck spinner" has *no UI surface* — it's a store-state correctness
  fix only. Left one guest test task `PASS-create-*` in dev Atlas.

### P1 #4 — search query not URL-encoded — DONE (2026-06-06)
`task.js:53` built `/task/searchTask?q=${searchTerm}` by raw interpolation → `&`/`#`/spaces broke the query.
Now passes `params: { q: searchTerm }` so Axios URL-encodes it. Backend param name confirmed
(`controller.js:142` reads `req.query.q`). Isolated — no protected files.

### P1 #15 — taskDetail white-screen — DONE (2026-06-06)
`taskDetail.jsx:262` now `editedTask.progress?.steps || []` (matches the file's own idiom at lines 112/140).
Needed the `|| []` not just `?.`: `ProgressField` reads `steps.length` unguarded, so `undefined` would
re-crash one level down. Also hardened `ProgressField` with a `steps = []` default param so the unguarded
`steps.length` is safe for any caller (covers `CreateTask.jsx:223` too).

### Backend Cluster A — DONE (branch `fix/backend-a1-deadcode-cleanup`, 25/25 Jest)
- #1 `helperController.js:40` `process.totalSteps`→`progress.totalSteps` (`fb83e94`)
- #2 `task/controller.js:59` removed spurious `()` in `new Types.ObjectId(t)` (`fb83e94`)
- #3 `user/service.js:79` dropped `"10m"`, uses default 15m (`fb83e94`)
- #5 deleted dead `TagController.js` + `tagRoutes.js` (`895bfd1`)
- #6 deleted broken `utils/notification.js` + `notificationRoute.js` + `getNotifications` call (`37cc33e`)
- **Kept on purpose:** `Tag` model+field (later removed in B#2); `notification` setting, `Notification` model, `User.notifications` array (dormant foundation).

### Backend Cluster B#1 — retry feature deletion — DONE (branch `fix/backend-b1-retry-deletion`)
End-to-end removal of the never-implemented `tryAgainTask` / `PUT /user/:id/attempt`. Backend 25/25 Jest;
frontend 67/67 Vitest (`aefb743`). Kept `"failed"` status + `TASK_STATUSES` (overdue cron produces it).

### Backend Cluster B#2 — Tag-collection → `priority` field — DONE (branch `fix/backend-b2-priority-migration`)
"Tag" was the (never-functioning) priority system. This *built* the priority backend rather than migrating one.
- **Backend (`915a2b0`):** `priority` string-enum on `Tasks` (default `low`); `taskConstants` added `PRIORITIES`, fixed `PRIORITY_ORDER` to lowercase highest-first; `createTask` persists priority; `updateTask` validates as plain enum; extracted+fixed sort into exported `compareTasksForFlatList`. Deleted `Models/Tag.js`, dead `processTags`, no-caller `tag` filter. New tests: `taskConstants.test.js`, `flatSort.test.js`. 31 Jest green.
- **Frontend (`baa272c`):** `CreateTask` sends `priority`; deleted dead `/tag` routes, `Tag.jsx`/`TagList.jsx`, `functions/tag.js`, commented picker in `taskDetail.jsx`. 67 Vitest green. **No picker shipped** → see open P6.
- **Migration (`959713a`):** `scripts/migrate-tag-to-priority.js` — idempotent, `--dry`, raw-driver collection. **Dev Atlas migrated** (4 tasks→`low`). **Prod → see open P0.**

### Frontend bug audit — 2026-06-06 read-only session
20 findings catalogued; none fixed. All live items promoted into P1–BL above. `frontend/frontend.md`'s
"No open bugs" line is **out of date**.

---

## Suggested skills / tooling
`/scrutinize` (before any fix plan) · `/diagnose` (P3#14, P3#16) · `/verify` (P5 date, P6 picker UI) ·
`/tdd` (Vitest regressions for #1,#3,#4,#12) · `/code-review` before committing a phase ·
`server-patterns` skill before editing backend modules.

## Related (reference, don't duplicate)
Architecture: `frontend/frontend.md`, `server/backend.md`, root `CLAUDE.md` ·
Phase history: `frontend/MIGRATION.md`, `server/MIGRATION.md` ·
Memory: `~/.claude/.../memory/MEMORY.md`
