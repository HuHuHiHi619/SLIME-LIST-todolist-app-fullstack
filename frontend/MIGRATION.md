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