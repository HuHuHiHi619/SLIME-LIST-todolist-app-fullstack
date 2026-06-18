# frontend/CLAUDE.md

React + Vite SPA for SlimeList. Supplements the root CLAUDE.md.

---

## Stack & Commands

React 18 + Vite, Redux Toolkit, TanStack Query v5, React Router v6, Tailwind, axios, Framer Motion. Vitest for tests.

```bash
npm run dev      # Vite dev server on :5173 (--host)
npm test         # vitest — 83 tests across 17 files
npm run build    # production build
npm run lint     # ESLint
npm run preview  # preview production build
```

---

## Architecture

### Data flow

Server state (read) → TanStack Query hooks in `src/hooks/queries/`
Client/UI state (write/mutations) → Redux Toolkit slices + thunks → `src/functions/*.js` → axios

```
Read:   Component → useXxxQuery() → axios → server
Write:  Component → dispatch(thunk) → src/functions/*.js → axios → server
                    └─ on success: invalidateQueries([key])
```

The global axios instance (`src/Config/axiosConfig.js`) sets `baseURL` (dev `VITE_LOCAL_API_URL`,
prod `/api`), `withCredentials: true`, and a **401 refresh-queue interceptor**: on 401 it queues
concurrent failures, calls `POST /refreshToken` once, replays the queue; on refresh failure it
dispatches `logoutUser()`.

### Redux — five slices

| Slice | Owns |
|-------|------|
| `userSlice` | `userData` (id, username, streak, settings, imageProfile), `isAuthenticated`, `isGuest`, loading/error |
| `taskSlice` | `tasks[]`, `categories[]`, `searchResults[]`, `selectedTask`, filter state |
| `uiSlice` | UI toggles: `isCreate`, `isTaskDetail`, `isPopup`, `isSidebarPinned` |
| `formSlice` | `formTask` (shared form state), `progress.steps[]` |
| `petSlice` | `lastReward` (most recent pet reward payload for toast display only) |

- `summarySlice` **removed** — summary data fetched via `useSummary` TanStack hook.
- Form state lives in `formSlice`, not `taskSlice`. Dispatch `setFormTask(task)` to pre-populate create/edit.
- `streakStatus` **removed from Redux** — no longer persisted to localStorage via middleware.

### TanStack Query hooks (`src/hooks/queries/`)

| Hook file | Key | What it fetches |
|-----------|-----|----------------|
| `useTasks.js` | `['tasks']` | Task list (with filter params) |
| `useUser.js` | `['user']` | Auth user profile |
| `useSummary.js` | `['summary']` | Dashboard analytics |
| `usePet.js` | `['pet']` | Pet state (exp, level, happiness, evolutionStage, pomodorosToday) |
| `usePomodoro.js` | — | `POST /api/pet/pomodoro` mutation; invalidates `['pet']` on success |

`QueryClient` configured in `src/lib/queryClient.js` and provided in `main.jsx`.

### Auth model

`components/auth/AuthProvider.jsx` dispatches `fetchUserData()` on mount to determine
authenticated / guest / unauthenticated. `PublicRoute` redirects logged-in users away from
`/login` and `/register`. All routes under `MainLayout` are guest-accessible.

### Routes

| Path | Component |
|------|-----------|
| `/` | `Home` |
| `/upcoming` | `Upcoming` |
| `/all-tasks` | `AllTask` |
| `/category` | `Category` |
| `/category/:categoryName` | `CategoryList` |
| `/settings` | `Settings` |
| `/pomodoro` | `Pomodoro` |
| `/login`, `/register` | `AuthTabs` (behind `PublicRoute`) |

All main routes use `React.lazy()` + `<Suspense fallback={<LoadingPage />}>`.

### Pet & Pomodoro

- `PetStagePanel` (dashboard) — reads `usePetQuery()` to show level, exp, happiness, evolutionStage, pet image, mood
- `PetRewardToast` — global toast (rendered in `App.jsx`); reads `pet.lastReward` from Redux and auto-clears
- `PomodoroTimer` (`src/components/pomodoro/`) — countdown timer with work/break phases; calls `onComplete` callback
- `Pomodoro` view — wraps `PomodoroTimer`; wires `onComplete` to `usePomodoroSession` mutation
- Settings page — work/break duration inputs; values stored in `localStorage` (keys: `pomodoro_work_duration`, `pomodoro_break_duration`)

### Folder Map

| Folder | Responsibility |
|--------|---------------|
| `src/functions/` | Thin axios wrappers per domain — no Redux, no JSX |
| `src/redux/` | Five slices (task, ui, form, user, pet); thunks call `src/functions/` |
| `src/hooks/queries/` | TanStack Query hooks for server state (tasks, user, summary, pet, pomodoro) |
| `src/hooks/` | Custom React hooks: `useFetchTask`, `usePopup` |
| `src/lib/` | `queryClient.js` — TanStack QueryClient config |
| `src/Config/` | Single file — global axios instance with baseURL + 401 refresh-queue interceptor |
| `src/components/views/` | Page-level views: Home, Upcoming, AllTask, Category, CategoryList, Settings, Pomodoro |
| `src/components/auth/` | AuthProvider, AuthTabs, PublicRoute, Logout |
| `src/components/dashboard/` | PetStagePanel, DailyMissionsPanel, CharacterStatsPanel, ActiveBuffsPanel, ProgressField, ProgressBar |
| `src/components/pomodoro/` | PomodoroTimer |
| `src/components/feedback/` | PetRewardToast, TaskErrorToast, SuccessPopup, InstructionPopup, Tooltip |
| `src/components/task/` | TaskList, TaskForm, CreateTask, CreateEntity, taskDetail, etc. |
| `src/components/layout/` | Navbar, Sidebar, SidebarLink |
| `src/components/animation/` | LoadingPage, FadeUpContainer, FlameBox, AutoTyping, SlimePortal, StaggerContainer |
| `src/components/forms/` | CalendarField, CategoryTagField, DeadlinePicker, NotificationForm, PriorityField, SearchField, inputField |
| `src/__tests__/` | Vitest tests mirroring `src/` structure |

---

## Risk Register

| File | Why risky | Test before touching |
|------|-----------|----------------------|
| `src/Config/axiosConfig.js` | All API calls flow through it; 401 refresh-queue is fragile | Test: normal request, 401 + valid refresh, 401 + expired refresh |
| `src/redux/taskSlice.jsx` | Owns tasks, categories, filter state; used by every page | Smoke-test: create/edit/complete/delete task, filter by status |
| `src/hooks/queries/usePet.js` | Drives PetPanel, DashboardTab, PetRewardToast | Test after task completion and pomodoro session |
| `src/components/feedback/PetRewardToast.jsx` | Reads `pet.lastReward` from Redux; must auto-clear | Test: complete a task, confirm toast shows and disappears |

---

## Do Not Touch

- `src/Config/axiosConfig.js` — auth gateway for every API call; no tests cover the interceptor.
- `src/redux/taskSlice.jsx` — owns task + filter state; a broken reducer corrupts the whole task UI.

---

## Development Gotchas

### TanStack Query invalidation
- After any mutation (task complete, pomodoro), call `queryClient.invalidateQueries(['pet'])` (and `['tasks']` / `['user']` as needed). Forgetting invalidation causes stale UI that doesn't reflect server changes.

### Pomodoro cooldown
- `POST /api/pet/pomodoro` enforces a 60s cooldown server-side; returns 429 on abuse. The `Pomodoro` view surfaces this as a user-visible error message.

### Error propagation
- All `src/functions/*.js` `throw` on error, so `createAsyncThunk` rejects and slice `error` state is set.

### Auth interceptor
- A bad `ACCESS_TOKEN_SECRET`, an expired token, and a tampered token all surface the same way: 401 → refresh attempt → potential logout. The interceptor does not distinguish them.

---

## Task Separation Rule

Every frontend task must declare its concern before starting:
- VISUAL: CSS/Tailwind/layout
- LOGIC: Redux/TanStack/handler/API
- ANIMATION: Framer Motion/transition

Never mix concerns in one phase.
