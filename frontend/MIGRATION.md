# frontend/MIGRATION.md

Frontend cleanup history. Evergreen guidance lives in `frontend/CLAUDE.md`.

---

## Refactoring goal

Make API error handling consistent (functions should `throw` so Redux thunks set `error` state),
remove dead files, harden `localStorage` access, and fix runtime bugs in hooks/validation —
keeping the vitest suite green (21 tests across 5 files).

---

## Phases

### Phase 0 — Baseline ✅
Test results (9 passed, 2 files): `src/__tests__/setup.test.js` (1 smoke test),
`src/__tests__/functions/task.test.js` (8 tests). Confirmed all task functions return `undefined`
on failure.
Inconsistency found: `updateTaskAttempt` threw in its catch block while every other `task.js`
function swallowed errors silently. Target for Phase 1: all functions should throw.

### Phase 1 — Consistent error propagation ✅
- `task.js` — 7 catch blocks fixed (added `throw error`)
- `category.js` — 3 catch blocks fixed (added `throw error`)
- `authen.js`, `summary.js` — already correct
- 21/21 tests passing across 5 files

### Phase 2 — Delete dead files ✅
Deleted: `routes/AdminRoutes.jsx`, `routes/UserRoutes.jsx`,
`components/pages/hooks/useFetchAllTask.jsx`, `src/index.jsx`. Tests: 21 passed.

### Phase 3 — ✅ (no separate changes recorded)

### Phase 4 — Harden localStorage ✅
- Wrapped `localStorage.getItem` read in `safeReadStreakStatus()` in `taskSlice.jsx`
- Wrapped both `localStorage.setItem` calls in `taskSlice.jsx` with try/catch
- `summarySlice.jsx` audited — no localStorage calls present
Tests: 21 passed.

### Phase 5 — Fix usePopup runtime bug ✅ (smoke test passed)
- Added `import { useNavigate } from "react-router-dom"` and `const navigate = useNavigate()` in
  `usePopup.jsx` — `handleActiveMenu` no longer throws `ReferenceError`.
- `handleClickOutside` reviewed: the `popupRef.current &&` guard is sufficient — no code change.
Tests: 21 passed.

### Phase 6 — Resolve remaining open issues ✅
- `userSlice.jsx` — extracted `const MIN_LOADING_MS = 2500`; `minimumLoading` default parameter now references the constant.
- `taskSlice.jsx` — removed all abandoned tag dead code: commented `fetchTags` thunk, commented `fetchTags` extraReducers, commented `tags`/`tag` state fields, commented `setTags` reducer, live `removeTags` reducer (referenced non-existent `state.tags` — silent bug), commented `tag:` lines in `updatedTask` thunk and `updatedTask.fulfilled`, commented `// setTags` export. No behaviour change.
Tests: 21/21 passed.

---

## Resolved (verified in code)

All known issues resolved. Full history:

- `usePopup.jsx` missing `navigate` — fixed (Phase 5).
- `useFetchAllTask.jsx` calling non-existent `fetchAllTasks` — file deleted (Phase 2).
- `CreateTask.jsx` validation comparing strings to numbers — now uses `.length` (`title.length > 50`, `note.length > 200`, `currentStep.length > 50`).
- `category.js` `error.resquest` typo — now `error.request`; all catch blocks `throw`.
- `AdminRoutes.jsx` rendering literal "AdminRoutes" text — file deleted (Phase 2).
- `taskSlice`/`summarySlice` unguarded `localStorage` — wrapped in try/catch (Phase 4).
- `src/functions/*.js` swallowing errors — all now `throw` (Phase 1).
- `userSlice.jsx:32` magic number `2500` — replaced with `MIN_LOADING_MS` constant (Phase 6).
- `taskSlice.jsx` commented tag dead code — fully removed; `removeTags` reducer (live but broken) also removed (Phase 6).

---

## Remaining work / still open

None — all phases complete.

---

## Checkpoint process

After each phase: run `npm test` (vitest), list pass/fail. Do not start Phase N+1 until Phase N is green.


---
## [TASK] Redux Slice Refactor (`src/redux`)
### Refactoring Goal / Objective
- Shrink and de-risk `taskSlice.jsx` (468 lines) by removing duplicate boilerplate and fixing 6 latent bugs found during exploration, without breaking the suite. Scope: through Phase 3 (no structural slice split). Conventions: error handling standardized on `rejectWithValue`; `isSummaryUpdated` standardized to toggle.

### Active Phases
#### Phase 0 — Safety net (characterization tests) ✅
- **Files Changed**: `src/__tests__/redux/taskSlice.test.js`, `userSlice.test.js`, `summarySlice.test.js` (all new)
- **Test Command**: `npm test -- --run`
- **Test Results**: 65 passed (was 21; +44 new across 3 slice files), 8 files
- **Status**: Fixed
- **Note**: Deliberately did NOT lock in the 3 buggy paths (`fetchTasks.rejected`, `setSelectedTask` toggle, `toggleTaskDetailPopup`) — their correct-behavior tests land with their fixes in Phase 1.

#### Phase 1 — Safe latent-bug fixes ✅
- **Files Changed**: `src/redux/taskSlice.jsx`, `src/redux/summarySlice.jsx`, `src/redux/userSlice.jsx`, `src/__tests__/redux/taskSlice.test.js`
- **Test Command**: `npm test -- --run`
- **Test Results**: 67 passed, 8 files
- **Status**: Fixed
- **Done**: `fetchTasks.rejected` now declares `action`; `setSelectedTask` sets `isTaskDetail = payload != null` (toggle bug + no-op branch removed); dead `toggleTaskDetailPopup` export removed; unused `logoutUser` import dropped from summarySlice; no-op `completedTask` listener + its import removed from userSlice.

#### Phase 2 — Convention standardization ✅
- **Files Changed**: `src/redux/taskSlice.jsx`, `src/redux/summarySlice.jsx`, `src/__tests__/redux/taskSlice.test.js`, `src/__tests__/redux/summarySlice.test.js`
- **Test Command**: `npm test -- --run`
- **Test Results**: 68 passed, 8 files
- **Status**: Fixed
- **Done**: `isSummaryUpdated` now toggles in completedTask/removedTask/removedAllTask (was `= true`). Task fetch thunks + createNewTask now `return rejectWithValue(error.message)`; all task + summary `.rejected` handlers read `action.payload` (summary previously used `rejectWithValue` but read `action.error.message` → showed "Rejected" instead of the real message; now fixed). userSlice already followed this contract.

#### Phase 3 — De-duplicate within taskSlice ✅
- **Files Changed**: `src/redux/taskSlice.jsx`
- **Test Command**: `npm test -- --run` + `npx eslint src/redux src/__tests__/redux`
- **Test Results**: 68 passed, 8 files; touched files lint-clean
- **Status**: Fixed
- **Done**:
  - Added `writeStreakStatus(value)` helper; replaced the duplicated try/catch `localStorage.setItem` in `setStreakStatus` and `completedTask.fulfilled`.
  - `resetFormTask` now assigns `initialState.formTask` / `initialState.progress` (was a re-typed literal). Verified safe: `progress.history.timestamps` is only ever written, never read, so the module-load vs fresh timestamp is unobservable; `createNewTask.fulfilled` already uses this exact reset.
- **Deliberately NOT done (senior-dev call):**
  - **loading/error matcher** — declined. A uniform `addMatcher(isPending/isRejected)` would *change* behavior given per-handler divergence (only `fetchSearchTasks.pending` clears error; only `fetchTasks.rejected` resets `tasks=[]`; `createNewTask.rejected` does not set `loading=false`). That's a behavior change, not a behavior-preserving dedupe, so it belongs in a separate fix phase. Extracting a one-line `state.loading = true` helper would be a premature abstraction.
  - **`upsertTaskById` helper** — declined. The three write handlers (`updatedTask`, `updatedTaskAttempt`, `completedTask`) look similar but genuinely differ (status-transition logic; `searchResults` handling; different merges for `tasks` vs `selectedTask`). A shared helper would need callback over-parameterization — a worse abstraction than three explicit blocks.

### Post-Mortem & Verified Fixes
- **`fetchTasks.rejected` crash**: handler read `action` but only declared `(state)` → `ReferenceError` on every failed fetch. Added the `action` param (Phase 1).
- **`setSelectedTask` toggle bug**: toggled `isTaskDetail` on every dispatch, so selecting a 2nd task while a panel was open *closed* it. Replaced with deterministic `isTaskDetail = action.payload != null` (Phase 1).
- **Dead exports/imports**: `toggleTaskDetailPopup` (exported, never defined, zero consumers), `logoutUser` import in summarySlice (unused), `completedTask` no-op listener in userSlice — all removed (Phase 1).
- **Summary error message swallowed**: summarySlice thunks used `rejectWithValue` but handlers read `action.error.message` → users saw "Rejected" instead of the real error. Handlers now read `action.payload` (Phase 2).
- **`isSummaryUpdated` stuck**: `= true` variants stopped triggering Summary re-fetch after the first change; standardized to toggle (Phase 2).

### Out of scope (flagged, not fixed)
- `userSlice.jsx` pre-existing lint: `minimumLoading` unnecessary try/catch wrapper; unused `state` params in `restoreState` / `logoutUser.fulfilled`. Pre-date this refactor.
- `usePopup.jsx:124` — `else if (popupRef)` always truthy (ref object). Lives in the hook, not `redux/`.

---

## [TASK] Mobile Retrofit — Surgical mobile-first overrides
### Refactoring Goal / Objective
Retrofit the live Slimelist app (currently desktop-first, broken on mobile)
so its mobile viewport matches the approved prototype (`Slimelist Mobile Demo.html`)
without rewriting the desktop layout. Strategy: `md:` responsive prefix isolation —
mobile baseline classes, `md:` classes restore desktop behavior.
Breakpoint: **768 px**. Desktop layout must remain byte-identical.

### Active Phases

#### Task 1a — Design tokens (`tailwind.config.js`) ✅
- **Files Changed**: `frontend/tailwind.config.js`
- **Test Command**: visual inspection + Tailwind build
- **Status**: Complete
- **Done**:
  - Added `slime.*` nested color object (20 tokens: bg, bg-2, card, card-2, surface, border,
    border-2, border-3, muted, muted-2, pink, pink-2, blue, blue-2, amber, amber-2, green, red,
    purple, purple-2). Purely additive — zero existing tokens changed.
  - Added `fontFamily.display` → Jockey One (font already loaded in `index.html`).
  - Added `boxShadow` tokens: slime-card, slime-purple, slime-glow.
  - Added keyframes + animations: slime-slidein, slime-fadein, slime-popin.
  - **Cleanup during review**: removed `variants: {}` (dead in Tailwind v3); removed
    `"./src/**/*.css"` from `content` (incorrect purge target); removed `fade-to-green` and
    `fade-from-green` keyframes (identical to each other, zero usages across the codebase).

#### Task 1b — Global CSS (`src/index.css`) ✅
- **Files Changed**: `frontend/src/index.css`
- **Test Command**: visual inspection
- **Status**: Complete
- **Done**:
  - `html { color-scheme: dark }` — native browser controls (date pickers, scrollbars) render dark.
  - `.slime-pixel` — `image-rendering: pixelated/crisp-edges` for badge sprite assets.
  - `@media (prefers-reduced-motion: reduce)` — disables `.slime-anim-drawer`, `.slime-anim-backdrop`,
    `.slime-anim-modal` animations for users with the OS preference set.
  - **Cleanup**: removed stray Thai combining character `ิ` (Unicode artifact, line 12).

#### Task 2a — Mobile TopBar (`Navbar.jsx` + `layout.css`) ✅
- **Files Changed**: `src/components/pages/fixbar/Navbar.jsx`, `src/styles/layout.css`
- **Test Command**: visual inspection at <768px and ≥768px
- **Status**: Complete
- **Done**:
  - `layout.css` — `#nav-bar` rule changed from `flex` → `hidden md:flex`.
    Required because CSS ID specificity (0,1,0,0) beats Tailwind class (0,0,1,0);
    responsive guard must live at the ID rule, not on the JSX element.
  - `Navbar.jsx` — new `<header className="md:hidden …">` inserted before `<div id="nav-bar">`.
    Contains: hamburger (reuses `handleToggleSidebar()` from `usePopup`), brand logo + wordmark,
    and a no-op search button (`faMagnifyingGlass` — correct FA v6 name; search wired in a later task).
  - Desktop layout byte-identical — `<div id="nav-bar">` untouched.

#### Task 2b — Mobile Sidebar Drawer (`Sidebar.jsx` + `layout.css` + `SidebarLink.jsx`) ✅
- **Files Changed**: `src/styles/layout.css`, `src/components/pages/fixbar/Sidebar.jsx`,
  `src/components/pages/fixbar/SidebarLink.jsx`
- **Test Command**: visual inspection at <1024px and ≥1024px
- **Status**: Complete
- **Phase A Done**:
  - `layout.css` — sidebar transitions rewritten as CSS-only, separated by `@media`:
    - `< 1024px`: `transition: transform 0.3s ease` (overlay, no layout reflow)
    - `≥ 1024px`: `transition: width 0.3s ease` (push-based, content moves)
  - `Sidebar.jsx` — removed dead `transition-width duration-300` Tailwind classes; CSS now
    owns all transitions with no conflict risk.
- **Phase B Done**:
  - `Sidebar.jsx` — mobile backdrop portal (`lg:hidden fixed inset-0 bg-black/50 z-30`)
    rendered via portal when `isSidebarPinned` is true; clicking it calls `handlePinSidebar()`.
  - `Sidebar.jsx` — `closeDrawerOnMobile()` helper wired to every nav link's `handleActiveMenu`
    callback; closes drawer when `window.innerWidth < 1024 && isSidebarPinned`.
  - `SidebarLink.jsx` — active nav pill (`layoutId` FLIP) replaced with plain `div.active-pill`;
    opacity controlled by CSS: `< 1024px` fades `0.3s ease` in sync with sidebar transform via
    `sidebar-collapsed` parent class; `≥ 1024px` instant swap.
- **Verified (4 cases)**:
  1. Mobile tap nav link → pill fades with sidebar ✓
  2. Mobile tap backdrop → sidebar closes, active pill stays (no route change) ✓
  3. Mobile reopen drawer → pill fades back in ✓
  4. Desktop navigate → instant swap, no opacity change ✓

#### Task 3 — Home Layout Mobile-First (`Home.jsx` + `layout.css` + component responsive tweaks) ✅
- **Files Changed**: `src/components/pages/user/Home.jsx`, `src/styles/layout.css`,
  `src/components/pages/ui/StreakField.jsx`, `src/components/pages/ui/Summary.jsx`,
  `src/components/pages/ui/TaskList.jsx`
- **Test Command**: visual inspection at <1024px and ≥1024px; vitest run (63 passed, 6 files)
- **Status**: Complete
- **Done**:
  - `layout.css` — `#home` is now mobile-first: `flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-y-6`.
    Previously `pt-2 lg:grid grid-cols-2` (mobile had no layout rule, components were hidden).
  - `Home.jsx` — complete layout rewrite using explicit CSS Grid placement. Removed the old
    `hidden lg:flex` sidebar-column wrapper and the mobile-only `SearchField`/`DashboardTab` block
    (search and tabs are now handled by the sidebar/navbar retrofit). Four semantic divs with
    `lg:col-start-*` / `lg:row-start-*` classes control desktop placement; mobile stacking order
    is document order: Streak → Tasks → Badge → Summary.
  - `StreakField.jsx` — removed `hidden xl:flex` (was hiding streak on most viewport widths).
    Text sizes now responsive (`text-3xl lg:text-7xl`); icon `text-[36px] lg:text-[50px]`;
    flame-box row `hidden lg:flex`; added `py-3` padding to stat cards.
  - `Summary.jsx` — removed `md:hidden` (was fully hiding the chart on mobile). Simplified
    class string: `grid border-2 border-purpleNormal rounded-3xl px-6 lg:h-[380px]`.
  - `TaskList.jsx` — task progress bar now visible on all viewports (removed `hidden md:flex`).
    Delete icon now `opacity-40` on mobile (touch-friendly) vs `opacity-0` on desktop (hover-reveal).

#### Tooling — UI Polish Skill (`frontend/skills/ui-polish/SKILL.md` + `frontend/CLAUDE.md`) ✅
- **Files Changed**: `frontend/skills/ui-polish/SKILL.md` (new), `frontend/CLAUDE.md`
- **Status**: Complete
- **Done**:
  - Created `SKILL.md` as the single source of truth for design tokens — extracted from
    `tailwind.config.js` and live components. Documents all custom color tokens (9 desktop flat,
    20 slime mobile, 11 gradient, 3 shadow), border-radius patterns, font-size scale actually in
    use, spacing/gap conventions, and 10 polish rules (borders, hover transitions, opacity floor
    on mobile, breakpoint discipline, text-gradient pattern, dark-only palette, animation classes).
  - Added a "UI Polish Skill" trigger section to `frontend/CLAUDE.md` listing 7 task types
    (color audit, border radius, font size, spacing, hover/animation, visual imbalance, mobile
    styles) that must consult `SKILL.md` before making changes.

#### Task 4 — Mobile TaskForm / CreateTask ❌ Cancelled
- **Status**: Cancelled — owner will implement manually

#### Task 5 — Sidebar desktop transition asymmetry ❌ Cancelled
- **Status**: Cancelled — owner will implement manually
- **Context**: On desktop, sidebar open (expand) was perceived as faster than close (collapse) despite symmetric `0.3s ease` transition. Root cause not fully traced before cancellation.

### Known Bugs
- **Sidebar desktop transition asymmetry** (`layout.css`): On desktop, the sidebar open (expand)
  animation is perceived as faster than close (collapse). Root cause: CSS `@media (min-width: 1024px)`
  applies `transition: width 0.3s ease` symmetrically but the expand still feels faster. Full
  reproduce/trace/hypothesis documented in session — skipped to unblock Phase B. Revisit before
  Task 2b sign-off.

### Post-Mortem & Verified Fixes
- **`fade-to-green` / `fade-from-green` dead code**: both keyframes were identical and had zero
  usages across `src/`. Removed both rather than keeping one with no consumers.
- **CSS content glob**: `"./src/**/*.css"` in the Tailwind content array would scan global CSS files
  for class names, causing incorrect purging and slower builds. Removed.
- **Jockey One font**: confirmed present in `index.html` line 9 before adding `fontFamily.display`
  token — no silent system-ui fallback risk.
- **CSS ID specificity trap** (Task 2a): `#nav-bar { display: flex }` in `layout.css` has specificity
  (0,1,0,0) and overrides any Tailwind class. The `hidden md:flex` guard was applied directly to the
  ID rule — not to the JSX element — to avoid a silent no-op.

---

## [TASK] Cluster B #1 — Delete retry ("Try Again") feature (frontend half)
### Refactoring Goal / Objective
Remove the dead client-side retry feature whose backend was already deleted on branch
`fix/backend-b1-retry-deletion` (the `PUT /user/:id/attempt` endpoint now 404s). Frontend deletion
must ship with the backend branch so `main` never has a window where the button errors.
Concern: LOGIC + one small VISUAL element (the button). Pure deletion, no new behavior.

#### Single phase — End-to-end removal ✅
- **Files Changed**: `src/functions/task.js`, `src/redux/taskSlice.jsx`,
  `src/components/pages/ui/taskDetail.jsx`, `src/__tests__/functions/task.test.js`
- **Test Command**: `npm test` + `npm run build` + `npx eslint` (touched files)
- **Test Results**: 67 passed, 8 files (was 68 — removed the `updateTaskAttempt` throws-on-failure
  test); build clean; touched files introduced no new lint errors.
- **Status**: Complete
- **Done**:
  - `task.js` — deleted `updateTaskAttempt` axios fn (`PUT /user/:id/attempt`).
  - `taskSlice.jsx` — dropped `updateTaskAttempt` import, the `updatedTaskAttempt` thunk, its
    `.fulfilled` extraReducer case, and the dead `tryAgainCount: 0` field in `initialState.formTask`.
  - `taskDetail.jsx` — removed `handleTryAgainTask`, the `faRotateLeft` rotate-button block (shown
    only when `status === "failed"`), and the now-unused `FontAwesomeIcon`/`faRotateLeft` imports.
  - `task.test.js` — removed the `updateTaskAttempt` import + its test.
- **Kept intact**: the `"failed"` task status and its label rendering in `taskDetail.jsx` — the
  overdue cron still produces `failed`; only the *recovery action* is removed, not the status.
- **Note**: the Phase-3 historical note above (taskSlice §"Out of scope", `upsertTaskById` decline)
  references `updatedTaskAttempt` as one of three write handlers — left as a point-in-time record;
  that handler no longer exists.
---

## P2 — SearchField debounce + branch logic ✅ (2026-06-06)

- **File**: `src/components/pages/ui/SearchField.jsx`
- **Test**: `npx vitest run` (67/67, 8 files) + `npx eslint` (touched file)
- **#13** debounce was rebuilt every render → no actual debouncing, one request
  per keystroke, leaked timers. Wrapped in `useRef(debounce(...)).current` (stable
  across renders; `dispatch` is stable so captured once). Added `debounceSearch`
  to the cleanup-effect deps now that its identity is stable (silences
  exhaustive-deps).
- **#12** branch logic was two separate `if`s: empty term cleared *then still*
  fired `fetchSearchTasks("")`; an exactly-50-char term hit neither branch (no-op).
  Now a single chain: `if (!term) clear; else if (len <= 50) fetch;` (>50 → no-op).
- **Lint**: 5 pre-existing baseline errors remain (`React` unused + 4 `prop-types`);
  no new problems, exhaustive-deps warning cleared.
- **Scrutinize finding (logged to BACKLOG, not P2)**: `taskDetail.jsx:25` uses
  `useRef(debounce(...))` but calls it without `.current` (lines 58/82/100…) — that
  debounce path is broken/dead. Do NOT copy it as the reference idiom.

---

## P4 #3 — `setFormTask` safe date coercion ✅ (2026-06-06, `/scrutinize`)

- **File**: `src/redux/taskSlice.jsx` (protected) + `src/__tests__/redux/taskSlice.test.js`
- **Test**: `npm test` (71/71, 9 files; was 69) + `npx eslint` on both touched files (clean)
- **Bug**: `setFormTask` guarded `new Date(value).toISOString()` only on `undefined`. Scrutiny
  traced the call site: `CreateTask.jsx:87` dispatches `setFormTask({ deadline: null })` when the
  user clears a deadline → `new Date(null)` = epoch 0 → deadline silently became `1970-01-01`
  instead of `null`. Invalid-string → `RangeError` reducer crash was latent (all current callers
  pass `.toISOString()` output or `null`) but real.
- **Fix**: extracted `toIsoDate(value, fallback)` — `undefined`→keep current · `null`→stay null ·
  invalid→keep current (no throw) · valid→ISO. Applied to both `startDate` and `deadline`.
- **Tests added**: clear deadline → `null` (not 1970); invalid date → no throw + prior value kept.
- **P4 #2 deferred** (not done): would write `state.task.error`, which **no component reads**
  (same dead-state as runtime-verify #21); all call-site catch blocks already `console.error`
  without reading `.message`. Bundle with the #21 error/loading-UI decision. See BACKLOG.
- **Lint**: the 490 baseline errors are the pre-existing project-wide set (`React`/`StrictMode`
  unused, `userSlice` warnings); the two files touched here are lint-clean.

---

## P5 #18 + P6 — date unification + priority picker ✅ (2026-06-06, code + unit tests; runtime `/verify` pending)

- **Files**: `src/functions/date.js` (new), `src/components/pages/ui/PriorityField.jsx` (new),
  `src/components/pages/create/CreateTask.jsx` (protected), `src/components/pages/ui/taskDetail.jsx`
  (protected); tests `src/__tests__/functions/date.test.js`, `src/__tests__/components/PriorityField.test.jsx` (both new).
- **Test**: `npm test` → **78/78, 11 files** (was 71; +4 date, +3 priority).
- **P5 #18 — date convention unified (decision: local-instant / raw ISO).** Root cause was
  *divergence*: `CreateTask` hand-shifted the TZ offset (stored UTC-midnight of the picked day) while
  `taskDetail` did raw `toISOString()` (stored the local-midnight instant) → a task created then
  edited could jump a calendar day. Both pickers read back with `new Date(value)` in local time, so
  the raw ISO instant round-trips to the same calendar day in the user's own TZ for any offset.
  Extracted `toDayISO(date)` (`functions/date.js`, null/invalid → `null`); both `handleDateChange`
  paths now call it. CreateTask's offset math deleted. `taskSlice` `toIsoDate` (reducer guard, P4#3)
  is a separate concern and untouched.
- **P6 — priority picker shipped.** New `PriorityField` = styled **native `<select>`** (low|medium|high,
  values match backend `PRIORITIES`); chosen over cloning `CategoryTagField`'s custom dropdown because
  priority is a fixed enum and a native control is accessible by default and emits a real
  `{target:{name,value}}` event. Rendered in the category/date row of both files. **No new wiring**:
  `setFormTask` spreads `...rest` so create persists `priority` (already sent at `handleSubmit`); on
  taskDetail the existing `handleInputChange`→`debouncedUpdateTask`→`updatedTask` PUT carries it, and
  backend `updateTask` defaults `updateData.priority || existing.priority || "low"`.
- **BL #23 correction**: this session's `/scrutinize` traced `taskDetail.jsx:25-47` — the `useRef(...)`
  ends with **`.current`**, so `debouncedUpdateTask` is the debounced *function* and all call sites
  (incl. `.flush()`) are correct. The autosave path is **not** broken; the old "called without
  `.current`" note (BACKLOG BL #23 / P2 scrutinize log above) is stale and should be closed.
- **Lint**: only `PriorityField.jsx` adds entries, all in the two pre-existing baseline classes
  (`React`-unused + `react/prop-types` missing) shared by every sibling component; `date.js` and both
  test files are lint-clean. No prop-types added to PriorityField to stay consistent with the codebase
  (which uses none).
- **Backend interaction (verify at runtime)**: raw-ISO moves the stored deadline instant by ~the TZ
  offset; the overdue cron (`cronJob.js:19-20`) compares instants, so confirm a task due "tomorrow"
  isn't prematurely failed. Out of scope: the cron already marks tasks overdue from the *start* of the
  due day (separate latent item).
- **Outstanding**: runtime `/verify` (guest mode, Playwright @ 390/768/1280) — create+edit date
  round-trips to same day; priority persists on create and autosaves on edit (network shows `PUT` with
  `priority`).

---

## P7 — Popup mutation consistency ✅ (2026-06-07, code + unit tests; GUI smoke not run)

One house pattern (pessimistic) for all five popup/sidebar mutation handlers in `usePopup.jsx`.
Absorbs BL #26, folds in the `usePopup` half of BL #20. Builds on the P4 #2 / #21 error toast (PR #9).

**Decision: Option A (pessimistic everywhere).** Rejected Option B (optimistic + rollback) — product
direction is "keep core simple," and the rejected matcher's toast already covers failure, so rollback
code earns nothing until delete latency is actually felt.

**The bug fixed.** `handleRemovedItem` (category delete) was the *only* optimistic handler and had
**no rollback**: it dispatched `removeCategories(id)` to drop the category from the sidebar *before*
awaiting `removedCategory(id)`. After PR #9 a failed delete showed the category gone **and** an error
toast → contradictory state until refetch.

**`/scrutinize` (run on the plan before coding) caught two errors in the original plan:**
1. The plan claimed pure Option A ("drop the optimistic call, let the fulfilled reducer / refetch
   remove it") was enough. **False** — `removedCategory.fulfilled` only set `lastStateUpdate`, and
   *nothing refetches the category list* (`useFetchTask.jsx:17` refetches **tasks** on the
   `lastStateUpdate` bump; `state.categories` is only written by `fetchCategories.fulfilled`). The
   optimistic reducer was the *sole* remover. Fix: move the removal **into** `removedCategory.fulfilled`,
   filtering by `action.meta.arg` (the categoryId).
2. The plan said "delete the `catch` blocks." **Would introduce unhandled promise rejections** —
   `.unwrap()` re-throws, and an async event handler with no catch leaks "Uncaught (in promise)". The
   matcher sets `state.error` independently, so the toast fires regardless: only the `console.error`
   *line* was redundant, not the catch. Kept `try/catch`, deleted the logging.

**Changes.**
- `taskSlice.jsx` — `removedCategory.fulfilled` now filters `state.categories` by `action.meta.arg`
  (pessimistic; removed only after the server confirms). Deleted the now-dead `removeCategories`
  reducer + its export (grep confirmed its only non-test refs were the def, export, and the removed
  `usePopup` call; `Sidebar.jsx:51` uses `setCategories`).
- `usePopup.jsx` — dropped the optimistic `removeCategories(id)` from `handleRemovedItem`; removed the
  100ms `setTimeout` in `handleCompletedTask` (await `fetchSummary`/`fetchUserData` directly, BL #20);
  kept every `try/catch` but replaced the `console.error`/`console.log` bodies with a one-line comment;
  removed the `removeCategories` import.
- `taskSlice.test.js` — replaced the dead `removeCategories` reducer test with two regression tests:
  `removedCategory.fulfilled` removes by `meta.arg`, and `.rejected` leaves `categories` untouched
  while setting `error` (the no-contradiction guarantee).

**Tests:** 86/86 pass (12 files). Lint: only pre-existing `'React' unused` in `usePopup.jsx:1`
(baseline, not introduced here); no new lint errors.

**GUI smoke NOT run** (user decision): no browser driver available in-env (Playwright/Chromium not
installed, no browser MCP). The risky reducer logic is covered by the two new unit tests. Deferred
manual smoke: happy = delete category disappears, no toast; failure = blocked `DELETE /category`
leaves the category in the list + shows the toast.

**Out of scope (deferred):** `CreateTask.jsx:113` 300ms timer (protected file, own phase — BL #20
remainder); BL #24 StartDatePicker time-component (protected).

---

## Frontend hygiene — strip dead `tasks.loading` (#21) + debug `console.log` (#9)  ·  2026-06-07

Two-phase cleanup, no protected files touched. Branch `fix/frontend-p7-popup-mutation-consistency`.

**Phase 1 — #21 dead `tasks.loading`.** Grep confirmed no component selects `state.tasks.loading`
(every `state.tasks` consumer destructures other keys); the flag was write-only. Removed it from
`taskSlice.jsx` `initialState` + all 12 `state.loading = …` writes across `fetchTasks`,
`fetchSearchTasks`, `fetchCategories`, `createNewTask`. Dropped the now-empty `.pending` handlers for
`fetchTasks`/`fetchCategories`/`createNewTask`; **kept** `fetchSearchTasks.pending` (it also clears
`error`) and every data/error write. `taskSlice.test.js`: deleted the `fetchTasks.pending sets loading`
test (nothing left to assert), stripped `loading` assertions + `loading: true` seeds from the
fulfilled/rejected tests while keeping their `tasks`/`error`/`categories` assertions.
(`userSlice.loading` / `summarySlice.loading` are separate and untouched — those *are* consumed.)

**Phase 2 — #9 debug logs (logs-only scope).** Removed the 14 pure-debug `console.log` (incl.
data-dumping ones) from `taskSlice.jsx` (4), `functions/task.js` (5, incl. "SENT DATA"),
`functions/authen.js` (2 — also dropped the now-empty `if(response){}` Login-success block),
`functions/category.js` (3). **Kept** all `console.error` catch logging (user chose safe scope),
and intentionally kept `axiosConfig.js` (interceptor tracing) + `ErrorBoundary.jsx`.

**Tests:** 85/85 pass (12 files; was 86 — one dead test removed). **Lint:** unchanged pre-existing
baseline (494 errors: `React`/`prop-types`/`no-useless-catch`); edits only delete lines, no new
violations introduced.

**Still open (out of scope here):** more debug `console.log` survive in *unnamed* files —
`userSlice.jsx:53` (leaks login response), `CreateEntity.jsx:53`, `usePopup.jsx:40`,
`Settings.jsx:83`, `GroupTaskForm.jsx:41`, `taskDetail.jsx:81-82`, and `CreateTask.jsx:110-124`
(**protected**). #9 named only the slice/functions files; these need a follow-up decision.
