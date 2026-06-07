# Completed Work Report — SlimeList (June 2026)

What's been **finished and verified**. Lifted out of `BACKLOG.md` so the backlog only tracks
open work. Open/planned items stay in `BACKLOG.md`. Newest at top.

**Legend:** ✅ done · 🧪 has tests · 👁️ runtime-verified (app actually run)

---

## At a glance

| # | Area | What | Result |
|---|------|------|--------|
| BL #7 | Frontend | `writeStreakStatus` moved to middleware — reducers now pure | ✅ 🧪 |
| BL #8 | Frontend | Dead localStorage token write removed from `register` | ✅ |
| BL #10 | Frontend | Fixed fragile spread order in `completeTask`/`removeTask` | ✅ |
| BL #5+#6 | Frontend | `userSlice` guest detection + shared-ref footgun | ✅ 🧪 |
| BL #17 | Frontend | `taskDetail` `useEffect` stale dep fixed | ✅ 🧪 |
| BL #19+#20+#24 | Frontend | `CreateTask` dead dispatch, 300ms setTimeout, `startDate` midnight | ✅ 🧪 |
| BL #21+#9 | Frontend | Dead `tasks.loading` stripped; debug `console.log` removed (10 files) | ✅ 🧪 |
| P7 / BL #26 | Frontend | Popup mutation consistency — pessimistic everywhere, `usePopup` + `taskSlice` | ✅ 🧪 |
| P8 | Frontend | App-level error boundary (render throws → fallback, not white screen) | ✅ 🧪 |
| P4 #2/#21 | Frontend | Task mutation errors now show a toast | ✅ 🧪 👁️ — *also fixed an app-wide crash the first commit shipped* |
| P4 #3 | Frontend | Safe date coercion in `setFormTask` (null→1970 bug) | ✅ 🧪 |
| P5 #18 | Frontend | Unified create/edit date handling (calendar-day round-trip) | ✅ 🧪 |
| P6 | Frontend | Priority picker UI (native `<select>`) | ✅ 🧪 |
| P3 #14 | Frontend | Deleted dead `handleActiveMenu` code | ✅ 🧪 |
| P3 #16 | Frontend | Fixed `useFetchTask` refetch-dep footgun | ✅ 🧪 |
| P2 #12/#13 | Frontend | SearchField branch logic + real debounce | ✅ 🧪 |
| P1 #1/#11 | Frontend | Create flow: stuck spinner + dead reset | ✅ 🧪 👁️ |
| P1 #4 | Frontend | URL-encode the search query | ✅ |
| P1 #15 | Frontend | `taskDetail` white-screen on missing steps | ✅ |
| P0 #25 | Backend | Overdue cron no longer fails east-of-UTC tasks a day early | ✅ 🧪 👁️ |
| Cluster A | Backend | Dead-code cleanup (5 fixes) | ✅ 🧪 |
| Cluster B#1 | Backend | Removed never-built "retry task" feature | ✅ 🧪 |
| Cluster B#2 | Backend | Built `priority` field (replaced defunct "Tag") | ✅ 🧪 |
| Prod migration | Backend | Tag→priority on prod | ✅ (vacuous — prod DB empty) |
| #23 | Frontend | `taskDetail` debounce — **not a bug**, closed | ✅ |

---

## Frontend (2026-06-07 audit pass)

### BL #7 — `writeStreakStatus` moved to middleware  ✅ 🧪
`localStorage.setItem` was called inside two reducer bodies (`setStreakStatus` and
`completedTask.fulfilled`), violating Redux purity. Exported `writeStreakStatus` from `taskSlice`;
removed both in-reducer calls; added `streakMiddleware` to `store.jsx` that fires after
`completedTask.fulfilled` with `payload.user` (the only live dispatch path — `setStreakStatus` had
zero call sites). Two new Vitest cases cover the write and no-write branches. **96/96 Vitest.**

### BL #8 — Dead localStorage token write in `register`  ✅
`authen.js` `register` wrote `localStorage.setItem("token", ...)` after signup. The app is
cookie-based; `userLogin` never did this; nothing read the key. Three-line deletion.

### BL #10 — Fragile spread order in `completeTask` / `removeTask`  ✅
Both returned `{ _id: taskId, ...response.data }`. If the server ever added a top-level `_id`,
it would silently override `taskId`, breaking the downstream thunk reducer keyed on `_id`.
Reversed to `{ ...response.data, _id: taskId }` so `taskId` is always authoritative.

### BL #5 + BL #6 — `userSlice` guest detection + shared-ref footgun  ✅ 🧪
**BL #5:** `fetchUserData.rejected` set `isAuthenticated=false` but left `isGuest` at `false`,
producing the invalid state `{ isAuthenticated: false, isGuest: false }`. Added `state.isGuest = true`.
**BL #6:** `initialState = { ...defaultState }` shared nested `userData` object references across
all reset call sites. Replaced with `makeDefaultState()` factory — every reset gets an independent
tree. **94/94 Vitest** (+3 regression).

### BL #17 — `taskDetail` `useEffect` stale dep  ✅ 🧪
`useEffect` dep was `[selectedTask]` (whole object reference), so the effect re-ran on every save
returning from the server (a new object reference for the same task). Changed to
`[selectedTask?._id]` — syncs only when a different task is opened. **86/86 Vitest** (+2 regression).

### BL #19 + BL #20 + BL #24 — `CreateTask` correctness fixes  ✅ 🧪
**BL #19:** `validator()` dispatched a stale `startDate` that always lost to the `taskData` midnight
fallback; deleted the dead block. **BL #20:** 300ms `setTimeout` for summary refetch replaced with
direct awaits inside an inner `try/catch` so `onClose()` always fires on success even if a summary
refresh fails. **BL #24:** Normalized all `new Date()` fallbacks to local midnight in `CreateTask`
and `StartDatePicker`. **91/91 Vitest** (+4 regression).

### BL #21 + BL #9 — Dead `tasks.loading` + debug log strip  ✅ 🧪
**BL #21:** `state.tasks.loading` was write-only — no component selected it. Removed from
`initialState` and all 12 thunk writes. **BL #9:** Stripped 14 pure-debug `console.log` calls
across `taskSlice`, `task.js`, `authen.js`, `category.js`, and 6 component files. All
`console.error` catch logging preserved. **85/85 Vitest.**

### P7 / BL #26 — Popup mutation consistency  ✅ 🧪
One house pattern (pessimistic) for all five popup/sidebar mutation handlers in `usePopup.jsx`.
`handleRemovedItem` was the only optimistic handler and had no rollback — on failure the category
vanished from the sidebar *and* an error toast fired. Fix: moved category removal into
`removedCategory.fulfilled` (filter by `action.meta.arg`). Dropped the optimistic pre-dispatch,
the 100ms `setTimeout` (BL #20 `usePopup` half), `console.error` bodies, and the dead
`removeCategories` reducer. **86/86 Vitest** (+2 regression). GUI smoke deferred.

---

## Frontend

### P8 — App-level error boundary  ✅ 🧪
React has no default boundary, so any throw in render unmounts the whole tree — the #21 toast crash
white-screened every user. Self-rolled `components/ErrorBoundary.jsx` (class component:
`getDerivedStateFromError` + `componentDidCatch`), branded `bg-purpleMain` fallback with a Reload
button, no new dependency (mirrors the `TaskErrorToast` choice). Wrapped `<TaskErrorToast/>` +
`<BrowserRouter>` in `App.jsx`, inside `AuthProvider`. Skipped the optional `location.pathname` reset
key — Reload is the honest recovery for corrupted render state. Regression test
(`__tests__/components/ErrorBoundary.test.jsx`): throw→fallback + healthy→passthrough. **85/85 Vitest**,
changed files lint-clean. (Note: repo-wide `react/prop-types` lint failure pre-dates this — see BACKLOG housekeeping.)

### P4 #2 + #21 — Task error toast  ✅ 🧪 👁️  *(branch merged in PR #9)*
Task mutations (update, complete, delete, delete-all, delete-category) failed silently. Added two
slice matchers — `isPending` clears `state.tasks.error`, `isRejected` sets it — plus a self-rolled
App-level `TaskErrorToast.jsx` (no dependency, auto-dismiss 4s). Clearing on pending means an
identical repeat error still re-fires the toast. **83/83 Vitest.**
- **Runtime verify (Playwright, forced 500 on `PATCH /task/:id/completed`):** toast renders bottom-right,
  auto-dismisses ~4.4s, repeat error re-fires, manual × works.
- **⚠️ Verify caught a crash the first commit shipped:** the component selected `state.task.error`
  (singular) but the store key is `tasks` (plural) → `undefined.error` threw on every render → with no
  error boundary the **whole app went blank for everyone**. Unit tests missed it (they test the reducer
  directly, never the selector key). Fixed `state.task`→`state.tasks`. **This is why P8 (error boundary)
  is now planned.**

### P4 #3 — `setFormTask` unsafe date coercion  ✅ 🧪
Clearing the deadline dispatched `setFormTask({ deadline: null })` → `new Date(null)` = epoch 0 →
deadline silently became `1970-01-01`. Extracted `toIsoDate(value, fallback)`: `undefined`→keep,
`null`→stay null, invalid→keep (no throw), valid→ISO. **71/71 Vitest** (+2 regression).

### P5 #18 — Date handling unified  ✅ 🧪
Create and edit used different conventions (TZ-offset math vs raw `toISOString()`), so a task created
then edited could jump a calendar day. Settled on the **local-instant / raw ISO** convention via a
shared `toDayISO` helper used by both paths. **78/78 Vitest.** *(This change is what surfaced the cron
bug P0 #25.)*

### P6 — Priority picker UI  ✅ 🧪
Added a styled native `<select>` `PriorityField` (low/medium/high) to create + edit. No new wiring —
create carries it via `...rest`, edit via the existing debounced PUT; backend defaults to `low`.
**78/78 Vitest.**

### P3 #14 — `handleActiveMenu` dead code  ✅ 🧪
Backlog misdiagnosed this as an inverted condition. Caller trace proved nav already works (react-router
`<Link>` + a `setActiveMenu(location.pathname)` effect); the function was called with no argument at all
5 sites → permanently inert. **Flipping the condition would have *broken* nav.** Deleted the dead function
+ now-unused imports; simplified the 5 wrappers to the one live behavior (close mobile drawer). **67/67.**

### P3 #16 — `useFetchTask` refetch dep  ✅ 🧪
No live infinite-loop, but a latent footgun: the dep array held a fresh-each-render `filter` object that
would refetch-on-every-render the moment any parent gained a redux subscription. Now deps on
`JSON.stringify(filter)`; removed dead `filterKey`. **69/69 Vitest** (+2 regression).

### P2 #12 + #13 — SearchField  ✅ 🧪
`#13` debounce was rebuilt every render → it never actually debounced (one request per keystroke,
leaked timers). Now `useRef(debounce(...)).current`. `#12` collapsed two `if`s into one chain, fixing
an empty-term double-fire and an exactly-50-char no-op. **67/67 Vitest.**

### P1 #1 + #11 — Create flow  ✅ 🧪 👁️
`#1` failed creates left the spinner stuck (`rejected` didn't reset `loading`). `#11` `resetFormTask()`
was a no-op (no `dispatch`) — deleted, since `fulfilled` already resets the form. **Runtime-verified**
happy + forced-500 paths. *(Note: no component reads `state.tasks.loading` yet — see open #21.)*

### P1 #4 — Search query URL-encoding  ✅
`/task/searchTask?q=${term}` broke on `&`/`#`/spaces. Now passed via Axios `params` so it's encoded.

### P1 #15 — `taskDetail` white-screen  ✅
Guarded `editedTask.progress?.steps || []` (the `|| []` matters — `ProgressField` reads `steps.length`
unguarded). Also hardened `ProgressField` with a `steps = []` default.

### #23 — `taskDetail` debounce  ✅ (closed, not a bug)
A re-trace showed the `useRef(...)` ends in `.current`, so the debounced autosave path was correct all
along. Closed as stale.

---

## Backend

### P0 #25 — Overdue cron TZ bug  ✅ 🧪 👁️  *(branch `fix/backend-p0-25-overdue-cron-tz`)*
After P5 #18, east-of-UTC deadlines stored as a raw instant crossed back over the UTC-midnight line, so
the overdue cron (runs in UTC on Render) marked them `failed` **one calendar day early** — e.g. a task
"due Jun 7" picked in TZ+7 failed the morning of Jun 7. Added pure, UTC-anchored
`overdueThreshold`/`isOverdue` with a 1-day grace (24h grace > 14h max TZ skew → never early in any zone).
Cost is a benign ~1-cron-cycle linger for UTC/east. **36/36 Jest** (+5 pure-function tests).

### Cluster A — Dead-code cleanup  ✅ 🧪  *(25/25 Jest)*
`helperController` `process.totalSteps`→`progress.totalSteps`; removed a spurious `()` in `new
Types.ObjectId(t)`; dropped a stray `"10m"` token; deleted dead `TagController`/`tagRoutes` and broken
`notification` util/route. Kept the dormant `Notification` model + `User.notifications` on purpose.

### Cluster B#1 — Retry feature removal  ✅ 🧪
End-to-end removal of the never-implemented `tryAgainTask` / `PUT /user/:id/attempt`. Kept the `"failed"`
status (the overdue cron produces it). Backend 25/25 Jest, frontend 67/67 Vitest.

### Cluster B#2 — "Tag" → `priority` field  ✅ 🧪
"Tag" was a never-functioning priority system. Rather than migrate it, *built* the priority backend:
`priority` string-enum on `Tasks` (default `low`), constants + fixed sort order, create/update wired,
`Models/Tag.js` and dead tag code deleted. **31 Jest.** Frontend sends `priority`, dead tag UI removed.
Migration script `migrate-tag-to-priority.js` (idempotent, `--dry`) — **dev Atlas migrated** (4 tasks→`low`).

### Prod tag→priority migration  ✅ (vacuous)
Dry-run against prod Atlas (`slimelist`) found it **completely empty** (0 docs) — nothing to migrate.
⚠️ **Open question:** if real prod data was ever expected, it isn't where `.env.production`'s `MONGO_URI`
points. (Still tracked in `BACKLOG.md`.)

---

## Backend refactor (earlier)
The 4-phase controller→module refactor and its bug post-mortems live in
[`.claude/history/BE_MIGRATION.md`](./BE_MIGRATION.md).
