# Redux Refactor Plan

Two-phase migration. This document covers Phase 1 only.

---

## Phase 1 — Split taskSlice into uiSlice + formSlice

**Goal:** Pure refactor. No behavior changes. All 96 tests stay green after.

---

### Why

`taskSlice.jsx` (431 lines) mixes 4 unrelated concerns. Unrelated things change for
unrelated reasons, making diffs noisy and bugs hard to isolate.

| Concern | Current home | New home |
|---|---|---|
| Server state (tasks, categories, search) | taskSlice | taskSlice (stays, gets smaller) |
| UI flags (popups, hover, sidebar, active menu) | taskSlice | **uiSlice** (new) |
| Form state (formTask, progress/steps) | taskSlice | **formSlice** (new) |
| Streak status | taskSlice | taskSlice (stays, Phase 2 decision) |
| Auth state + thunks | userSlice | userSlice (untouched) |
| Summary state + thunks | summarySlice | summarySlice (untouched) |

---

### Files to Create

#### `frontend/src/redux/uiSlice.jsx`

State:
```
isCreate, isTaskDetail, isPopup, popupMode,
isHover, isSidebarPinned, activeMenu, selectedTask
```

Actions exported:
```
toggleCreatePopup, setActiveMenu, togglePopup,
setHover, toggleSidebarPinned, setSelectedTask
```

Note: `setSelectedTask` keeps its coupled logic — setting `selectedTask` also
sets `isTaskDetail`. Both live here so the coupling stays internal to one slice.

Note: `selectedTask` holds a full task object here in Phase 1. Phase 2 will slim
it to a plain `selectedTaskId` string; task data will come from TQ cache instead.

---

#### `frontend/src/redux/formSlice.jsx`

State:
```
formTask: { title, note, startDate, deadline, category, status }
progress: { steps, totalSteps, allStepsCompleted, history }
```

Actions exported:
```
setFormTask, resetFormTask, addSteps, removeStep
```

extraReducers:
- Listens to `createNewTask.fulfilled` → resets `formTask` and `progress` to
  initial state. This import is one-directional: formSlice imports from taskSlice,
  taskSlice does NOT import from formSlice (no circular dependency).

Helper functions that move here: `toIsoDate` (used only by `setFormTask`)

---

### Files to Modify

#### `frontend/src/redux/taskSlice.jsx`

Remove from `initialState`:
- `formTask`, `progress`, `isCreate`, `isTaskDetail`, `selectedTask`
- `isPopup`, `popupMode`, `isHover`, `isSidebarPinned`, `activeMenu`

Remove reducers:
- `setFormTask`, `resetFormTask`, `addSteps`, `removeStep`
- `toggleCreatePopup`, `setActiveMenu`, `togglePopup`, `setHover`
- `toggleSidebarPinned`, `setSelectedTask`

Remove helpers: `toIsoDate`

Keep everything else: all thunks, all extraReducers, `streakStatus`,
`writeStreakStatus`, `safeReadStreakStatus`, remaining reducers.

**Critical:** In `createNewTask.fulfilled` extraReducer (currently lines 291-295),
delete the two lines that reset `state.formTask` and `state.progress`. After the
split those fields no longer exist in taskSlice's state — Immer will silently write
them as phantom properties if left in place. formSlice's own extraReducer handles
the reset instead.

Expected result: ~200 lines (down from 431).

---

#### `frontend/src/redux/store.jsx`

Add two new reducers:

```js
import uiReducer from "./uiSlice";
import formReducer from "./formSlice";

reducer: {
  tasks: taskReducer,
  ui: uiReducer,      // new
  form: formReducer,  // new
  user: userReducer,
  summary: summaryReducer,
}
```

---

### Import Sites to Update (21 files)

**Watch for mixed-slice destructuring** — some components pull fields from multiple
future slices in a single `useSelector(state => state.tasks)` call. These need two
separate `useSelector` calls, not just a path rename. Key cases:
- `CreateTask.jsx:29` — destructures `formTask`, `progress` (→ form) AND `categories` (→ tasks) together
- `usePopup.jsx:28` — reads `isPopup` (→ ui); also imports 9 actions that split across two sources

All `useSelector` calls referencing moved state must update their slice key:

| Old selector path | New selector path |
|---|---|
| `state.tasks.isCreate` | `state.ui.isCreate` |
| `state.tasks.isTaskDetail` | `state.ui.isTaskDetail` |
| `state.tasks.isPopup` | `state.ui.isPopup` |
| `state.tasks.popupMode` | `state.ui.popupMode` |
| `state.tasks.isHover` | `state.ui.isHover` |
| `state.tasks.isSidebarPinned` | `state.ui.isSidebarPinned` |
| `state.tasks.activeMenu` | `state.ui.activeMenu` |
| `state.tasks.selectedTask` | `state.ui.selectedTask` |
| `state.tasks.formTask` | `state.form.formTask` |
| `state.tasks.progress` | `state.form.progress` |

All `dispatch` calls importing moved actions must update their import source:

| Action | Old import | New import |
|---|---|---|
| `toggleCreatePopup` etc. | `../redux/taskSlice` | `../redux/uiSlice` |
| `setFormTask` etc. | `../redux/taskSlice` | `../redux/formSlice` |

---

### Tests to Update

`taskSlice.test.js` imports every action being moved and asserts on `state.isCreate`,
`state.formTask`, `state.progress` — all of which leave the slice. It must be split
into three files:

- `__tests__/redux/taskSlice.test.js` — keep only server-state tests (fetchTasks,
  createNewTask, completedTask, etc.); remove all UI and form assertions
- `__tests__/redux/uiSlice.test.js` — cover all UI toggle actions and initial state
- `__tests__/redux/formSlice.test.js` — cover setFormTask, addSteps, removeStep,
  and the `createNewTask.fulfilled` auto-reset behavior

Update component/hook tests that import moved actions from taskSlice.

---

### Definition of Done

- `npm test` passes all 96 tests
- `npm run lint` passes
- No component behavior changes (pure import path refactor)

---

## Phase 2 — TanStack Query (planned, not yet detailed)

Replace all server-state thunks with TQ queries/mutations. Redux slims to
client-only state. `summarySlice` server state deleted; `isSummaryUpdated`
toggle replaced by `queryClient.invalidateQueries`. Detailed in a separate plan.
