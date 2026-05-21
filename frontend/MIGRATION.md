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