# frontend/CLAUDE.md

React + Vite SPA for SlimeList. Supplements the root CLAUDE.md. Migration history → `frontend/MIGRATION.md`.

---

## Stack & Commands

React 18 + Vite, Redux Toolkit, React Router v6, Tailwind, axios, Framer Motion. Vitest for tests.

```bash
npm run dev      # Vite dev server on :5173 (--host)
npm test         # vitest — 21 tests across 5 files
npm run build    # production build
npm run lint     # ESLint
npm run preview  # preview production build
```

---

## Architecture

### Data flow (always in this order)

```
Component → dispatch(asyncThunk) → src/functions/*.js → axios (global instance)
```

1. **`src/functions/`** — domain API functions (`task.js`, `category.js`, `authen.js`, `summary.js`). Plain async axios calls, no Redux. All `throw` on error so thunks can set `error` state.
2. **`src/redux/` slices** — async thunks call the functions layer; extraReducers update state.
3. **Components** — dispatch thunks; never call axios directly.

The global axios instance (`src/Config/axiosConfig.js`) sets `baseURL` (dev `VITE_LOCAL_API_URL`,
prod `/api`), `withCredentials: true`, and a **401 refresh-queue interceptor**: on 401 it queues
concurrent failures, calls `POST /refreshToken` once, replays the queue; on refresh failure it
dispatches `logoutUser()`.

### Redux — three slices

| Slice | Owns |
|-------|------|
| `userSlice` | `userData` (id, username, streak, badge, settings, imageProfile), `isAuthenticated`, `isGuest`, loading/error |
| `taskSlice` | `tasks[]`, `categories[]`, `searchResults[]`, `formTask` (shared form state), `progress` (steps), `selectedTask`, UI toggles (isCreate, isTaskDetail, isPopup, isSidebarPinned), `streakStatus` |
| `summarySlice` | `summary[]`, `summaryCategory[]`, `notification[]`, `instruction` toggle |

- **`taskSlice` owns form state** — `formTask` and `progress.steps[]` live in Redux, not local state. Dispatch `setFormTask(task)` to pre-populate the create/edit form.
- **`isSummaryUpdated`** is a boolean toggle: mutators flip it, Summary watches it to re-fetch. It holds the *fact* of a change, not the value.
- **`streakStatus`** is persisted to `localStorage` (via `safeReadStreakStatus()` + try/catch-wrapped writes) in addition to Redux.

### Auth model

`components/pages/authen/AuthProvider.jsx` dispatches `fetchUserData()` on mount to determine
authenticated / guest / unauthenticated. `PublicRoute` redirects logged-in users away from
`/login` and `/register`. All routes under `MainLayout` are guest-accessible — the backend enforces
ownership via the `guestId` cookie.

### Routing / Modals / Styling

- React Router v6 with `React.lazy()` + `<Suspense>`. `App.jsx` wraps everything in `<AuthProvider>`. `/` → `MainLayout` (Navbar + Sidebar + `<Outlet>`); `/login`, `/register` → `AuthTabs` behind `PublicRoute`.
- `TaskForm` and the Create popup render via `ReactDOM.createPortal` at body level, controlled by `isCreate`/`isTaskDetail`/`isPopup` in `taskSlice`.
- Tailwind with custom colors (`purpleMain`, `purpleActive`) + animations (`fade-out`, `fade-to-green`) in `tailwind.config.js`. Global CSS in `src/styles/` split by concern.

### UX conventions

- `minimumLoading()` enforces a 2.5s minimum loading state on auth ops for animation polish.
- Font Awesome icons registered globally in `src/functions/fontAwesomeIconSetup.js`, imported once in `main.jsx`.

### Folder Map

| Folder | Responsibility |
|--------|---------------|
| `src/functions/` | Thin axios wrappers per domain — no Redux, no JSX. One file per domain |
| `src/redux/` | Three slices with async thunks; thunks call `src/functions/`, extraReducers update state |
| `src/Config/` | Single file — global axios instance with baseURL + 401 refresh-queue interceptor |
| `src/components/pages/` | Feature pages and sub-components by area: `authen/`, `user/`, `fixbar/`, `ui/`, `create/`, `animation/` |
| `src/components/pages/hooks/` | Custom hooks — non-standard location (inside `pages/`, not `src/hooks/`): `useFetchTask(filter)`, `usePopup()` |
| `src/styles/` | Global CSS split by concern: `components.css`, `layout.css`, `utils.css`, `datePicker.css` |
| `src/__tests__/` | Vitest tests (setup + `functions/`) |

---

## Known Issues

None open. All resolved issues logged in `frontend/MIGRATION.md`.

---

## Risk Register

| File | Why risky | Test before touching |
|------|-----------|----------------------|
| `src/components/pages/hooks/usePopup.jsx` | Used by almost every interactive component; owns task complete/remove, sidebar, popup, close-on-outside-click | Manually test: complete, delete, popup open/close, sidebar toggle, click-outside dismissal |
| `src/Config/axiosConfig.js` | All API calls flow through it; the 401 refresh-queue is fragile — mistakes cause retry loops or log users out every request | Test: normal request, 401 + valid refresh, 401 + expired refresh |
| `src/redux/taskSlice.jsx` | Owns tasks, form state, categories, all UI toggles; used by every page | Smoke-test: create/edit/complete/delete task, filter by status |
| `src/components/pages/create/CreateTask.jsx` | Validation is now fixed (`.length`); remaining risk is the manual date/timezone-offset handling and progress-step logic | Test: title/note/step at boundary lengths, creation with all fields, date/timezone correctness |

---

## Do Not Touch

- `src/Config/axiosConfig.js` — auth gateway for every API call; no tests cover the interceptor.
- `src/redux/taskSlice.jsx` — largest slice; owns form + task + UI state; a broken reducer corrupts the whole task UI.

---

## Development Gotchas

### Error propagation
- All `src/functions/*.js` now `throw` on error (Phase 1), so `createAsyncThunk` rejects and the slice `error` state is set. (Previously they swallowed errors and thunks resolved as fulfilled.)

### localStorage
- `taskSlice` reads/writes `streakStatus` to `localStorage` inside the slice. Reads go through `safeReadStreakStatus()` and writes are try/catch-wrapped (Phase 4) to survive private-mode / quota errors. Direct side effects in reducer bodies remain a Redux anti-pattern — keep new persistence out of reducers.

### Auth interceptor
- A bad `ACCESS_TOKEN_SECRET`, an expired token, and a tampered token all surface the same way: 401 → refresh attempt → potential logout. The interceptor does not distinguish them.

---

## Migration status

Phases 0–6 complete; all known issues resolved. No open items remain.
Full phase history and resolved-issue log: **`frontend/MIGRATION.md`**.


## Task Separation Rule
Every frontend task must declare its concern before starting:
- VISUAL: CSS/Tailwind/layout — use ui-polish skill
- LOGIC: Redux/handler/API
- ANIMATION: Framer Motion/transition
Never mix concerns in one phase.

## Visual Verification
After every UI change, run Playwright screenshots
at mobile (390px), tablet (768px), desktop (1280px).
/verify triggers this automatically.

---


