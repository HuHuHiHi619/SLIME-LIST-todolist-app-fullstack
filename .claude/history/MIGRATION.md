# MIGRATION.md

## Refactoring / Cleanup

- **Phase 0** — Baseline: 9 tests passing; `updateTaskAttempt` was the only function that threw in catch, all others swallowed errors silently.
- **Phase 1** — Added `throw error` to all catch blocks in `task.js`, `category.js`; 21/21 tests passing.
- **Phase 2** — Deleted dead files: `AdminRoutes.jsx`, `UserRoutes.jsx`, `useFetchAllTask.jsx`, `index.jsx`.
- **Phase 4** — Wrapped `localStorage` reads/writes in `taskSlice.jsx` with try/catch to guard against `SecurityError`.
- **Phase 5** — Added missing `useNavigate` import to `usePopup.jsx`; fixed `ReferenceError` in `handleActiveMenu`.
- **Phase 6** — Extracted `MIN_LOADING_MS` constant in `userSlice`; removed all commented-out tag dead code from `taskSlice`.

## Redux Slice Refactor

- **Phase 0** — Added characterization tests for `taskSlice`, `userSlice`, `summarySlice`; 65 tests, 8 files.
- **Phase 1** — Fixed `fetchTasks.rejected` crash (missing `action` param), `setSelectedTask` toggle bug, removed dead exports (`toggleTaskDetailPopup`, unused `logoutUser` import, no-op `completedTask` listener).
- **Phase 2** — Standardized `isSummaryUpdated` to toggle; all task thunks now use `rejectWithValue`; summary `.rejected` handlers read `action.payload` instead of `action.error.message`.
- **Phase 3** — Extracted `writeStreakStatus` helper; `resetFormTask` now references `initialState` instead of re-typed literals; declined `loading/error` matcher and `upsertTaskById` as premature abstractions.

## Bug Fixes

- **BL #5/#6** — `fetchUserData.rejected` now resets `isGuest=true`; replaced shared `initialState` object with `makeDefaultState()` factory to prevent ref aliasing.
- **BL #7** — Moved `localStorage.setItem` out of reducers into `streakMiddleware` in `store.jsx` to restore reducer purity.
- **BL #8** — Removed dead `localStorage.setItem("token")` from `authen.js` register (app is cookie-based).
- **BL #10** — Fixed fragile spread order in `completeTask`/`removeTask` responses so `_id` is never overridden by server payload.
- **BL #19** — Deleted stale `startDate` dispatch in `CreateTask` validator; `handleSubmit` already applied its own fallback.
- **BL #20** — Replaced 300ms `setTimeout` in `CreateTask.handleSubmit` with direct awaits inside inner try/catch so modal closes even if summary refresh fails.
- **BL #24** — Normalized `startDate` defaults to local midnight via `toDayISO` in `CreateTask` and `StartDatePicker`.
- **P2 #12/#13** — Fixed `SearchField` debounce (was rebuilt every render); fixed branch logic so empty input clears and >50 chars is a no-op.
- **P4 #3** — Extracted `toIsoDate` in `formSlice`; `null` deadline now stores `null` instead of epoch 0 (`new Date(null)`).
- **P5 #18** — Unified date convention (`toDayISO`) across `CreateTask` and `taskDetail` to stop calendar-day drift on edit.
- **P6** — Added `PriorityField` native `<select>` to `CreateTask` and `taskDetail`; wired through existing `setFormTask`/`handleInputChange` paths.
- **P7** — Made all popup mutation handlers pessimistic; moved category removal to `removedCategory.fulfilled`; deleted broken optimistic `removeCategories` reducer.
- **#9** — Removed 14 debug `console.log` calls from `taskSlice`, `task.js`, `category.js`, `authen.js`.
- **#21** — Removed write-only `tasks.loading` flag (no component ever read it) and its 12 write sites.
- **Retry deletion** — Removed `updateTaskAttempt` function, thunk, and "Try Again" button from `taskDetail`; backend endpoint was already deleted.

## Mobile Retrofit

- **1a** — Added `slime.*` color tokens, `fontFamily.display`, shadow tokens, and animation keyframes to `tailwind.config.js`.
- **1b** — Added `color-scheme: dark`, `.slime-pixel` image rendering, and `prefers-reduced-motion` rules to `index.css`.
- **2a** — Added mobile `<header>` TopBar (hamburger + logo) to `Navbar.jsx`; hid desktop `#nav-bar` below `md:` via CSS ID rule.
- **2b** — Rewrote sidebar transitions as CSS-only per breakpoint; added backdrop portal and `closeDrawerOnMobile` helper to `Sidebar.jsx`.
- **3** — Converted `#home` to mobile-first flex/grid; made `StreakField`, `Summary`, and task progress bar visible on all viewports.

## TanStack Query Migration

- **Phase 1** — Split `taskSlice` into `uiSlice` + `formSlice` + slimmed `taskSlice`; 109 tests, 17 files.
- **Phase 2A** — Installed TQ; created `lib/queryClient.js` singleton; wrapped `main.jsx` with `QueryClientProvider`; created stub hook files.
- **Phase 2B** — Replaced `fetchTasks`, `fetchCategories`, `fetchSearchTasks` thunks with `useTasksQuery`, `useCategoriesQuery`, `useSearchTasksQuery`; rewrote `useFetchTask.jsx` and `SearchField.jsx`.
- **Phase 2C** — Replaced all 6 write thunks with `useMutation` hooks; `taskSlice` is now ~35 lines (`streakStatus` only); error channel: `state.ui.taskError` → `TaskErrorToast`.
- **Phase 2D** — Replaced summary thunks with `useSummaryQuery`/`useSummaryByCategoryQuery`; deleted `summarySlice`; moved `instruction` + `toggleInstructPopup` to `uiSlice`; 85 tests, 17 files.
- **Phase 2E** — Replaced `fetchUserData` thunk with `useUserQuery` (staleTime 5 min, retry false); `AuthProvider` now uses TQ `isLoading` instead of local `initialCheckAttempted` state; added `setUserData` reducer to `userSlice`; `Logout` clears `['user']` query on logout; 83 tests, 17 files.
