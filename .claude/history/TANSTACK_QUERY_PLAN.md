# TanStack Query Migration Plan — Phase 2

Goal: Replace all server-state thunks with TQ queries/mutations. Redux retains
only client-only state. All tests stay green after each sub-phase.

---

## Why

The current pattern — thunk → extraReducer → `state.tasks.*` — requires manual
invalidation (`lastStateUpdate`, `isSummaryUpdated` toggles), duplicates loading/
error state that TQ provides for free, and forces every caller to `await dispatch(...).unwrap()`.
TQ gives automatic background refetch, stale-while-revalidate, and a single
invalidation call that cascades correctly.

---

## What survives in Redux after Phase 2

| Slice | Keeps |
|---|---|
| `uiSlice` | unchanged |
| `formSlice` | unchanged |
| `taskSlice` | `streakStatus` + `setStreakStatus` only |
| `userSlice` | auth flags (`isAuthenticated`, `isGuest`, `userData`, `isRegisterPopup`, `loading`, `authError`) + `loginUser`/`logoutUser` mutations stay as RTK thunks (see note) |
| `summarySlice` | **deleted**; `toggleInstructPopup` moves to `uiSlice` |

> **Why keep loginUser/logoutUser as RTK thunks?**
> The token-refresh interceptor in `axiosConfig.js` queues requests and
> dispatches `fetchUserData` on success. Mixing RTK dispatch and TQ
> QueryClient inside the interceptor is fragile. Auth mutations stay in RTK;
> `fetchUserData` becomes a TQ query that AuthProvider uses.

---

## Sub-phases

### 2A — Install + scaffold (no behavior change)

1. Install: `npm install @tanstack/react-query @tanstack/react-query-devtools`
2. Create `frontend/src/lib/queryClient.js` — exports a single `QueryClient` instance
3. Wrap `main.jsx` with `<QueryClientProvider client={queryClient}>`
4. Create `frontend/src/hooks/queries/` directory with four hook files (stubs first)

**Test gate:** `npm test` still passes 109 tests. No component changes yet.

---

### 2B — Task + category reads

Replace `fetchTasks`, `fetchCategories`, `fetchSearchTasks` thunks with TQ.

#### New: `hooks/queries/useTasks.js`

```js
// Queries
useTasksQuery(filter)           // useQuery(['tasks', filter], () => getData(filter))
useCategoriesQuery()            // useQuery(['categories'], getCategoryData)
useSearchTasksQuery(searchTerm) // useQuery(['search', searchTerm], ..., { enabled: len >= 1 })
```

#### Components to update

| File | Change |
|---|---|
| `useFetchTask.jsx` | Replace `dispatch(fetchTasks)` + `lastStateUpdate` dep with `useTasksQuery(filter)` |
| `CreateTask.jsx` | Replace `dispatch(fetchCategories())` useEffect with `useCategoriesQuery()` |
| `Sidebar.jsx` | Replace `dispatch(fetchCategories())` useEffect; **also** remove `dispatch(setCategories([...categories, newItem]))` optimistic push in `handleAddItem` — TQ auto-refetches on invalidation so the push is redundant |
| `SearchField.jsx` | Replace `dispatch(fetchSearchTasks)` with `useSearchTasksQuery(term, { enabled: term.length >= 1 && term.length <= 50 })`; remove cleanup `dispatch(clearSearchResults())` — TQ clears when `enabled` goes false |

#### Redux changes

Remove from `taskSlice`:
- State: `tasks`, `searchResults`, `categories`, `lastStateUpdate`, `lastUpdated`
- Thunks: `fetchTasks`, `fetchSearchTasks`, `fetchCategories`
- extraReducers for the three above
- `clearSearchResults` reducer (TQ manages this via `enabled` flag)
- `setCategories` reducer (TQ cache replaces manual push; `handleAddItem` in Sidebar no longer needs it)

**Test gate:** 109 tests. `useFetchTask.test.jsx` must be rewritten to use TQ
(`renderHook` with `QueryClientProvider` wrapper instead of Redux Provider).

---

### 2C — Task mutations

Replace `createNewTask`, `updatedTask`, `completedTask`, `removedTask`,
`removedAllTask`, `removedCategory` with TQ mutations.

#### New: additions to `hooks/queries/useTasks.js`

```js
useCreateTaskMutation()    // onSuccess: invalidate ['tasks'], ['summary'], ['summaryByCategory']
useUpdateTaskMutation()    // onSuccess: invalidate ['tasks'], update selectedTask via setSelectedTask
useCompleteTaskMutation()  // onSuccess: invalidate + writeStreakStatus + fetchUserData
useRemoveTaskMutation()    // onSuccess: invalidate ['tasks'], ['summary']
useRemoveAllTaskMutation() // onSuccess: invalidate ['tasks'], ['summary']
useRemoveCategoryMutation()// onSuccess: invalidate ['categories'], ['summaryByCategory']
```

#### Components to update

| File | Change |
|---|---|
| `usePopup.jsx` | Replace 5 `dispatch(thunk)` calls with mutation hooks |
| `CreateTask.jsx` | Replace `dispatch(createNewTask)` with `useCreateTaskMutation()` |
| `taskDetail.jsx` | Replace `dispatch(updatedTask)` with `useUpdateTaskMutation()` |

#### Redux changes

Remove from `taskSlice`:
- State: `isSummaryUpdated`, `error`
- Thunks: all six mutations listed above
- All extraReducers except the `streakStatus` update inside `completedTask.fulfilled`
  (that moves to mutation `onSuccess`)
- `clearTaskError` reducer
- `streakMiddleware` from `store.jsx` (logic moves to `useCompleteTaskMutation` onSuccess)

Remove from `store.jsx`:
- `streakMiddleware` export and `concat(streakMiddleware)`

**`TaskErrorToast` strategy:** Each mutation exposes its own `error`. Create a
`useTaskError` hook that subscribes to mutation errors via a shared `onError`
callback passed to `QueryClient` defaultOptions, and surfaces the last error in
a piece of `uiSlice` state (`taskError: null`). This keeps the existing toast UI
unchanged.

**`usePopup.jsx` try/catch removal:** Every handler currently wraps `dispatch(thunk).unwrap()`
in try/catch with `// failure surfaced via TaskErrorToast`. After conversion to
`mutation.mutate()` (not `mutateAsync`), errors never throw to the caller — they
only reach `onError`. Remove all try/catch wrappers in `usePopup.jsx` and replace
with plain `mutation.mutate(...)` calls. Do NOT use `mutateAsync` or the error
channel breaks.

**Test gate:** 109+ tests. New mutation tests added to `hooks/queries/useTasks.test.js`.

---

### 2D — Summary queries

Replace `fetchSummary`, `fetchSummaryByCategory` with TQ queries.
Delete `summarySlice`.

#### New: `hooks/queries/useSummary.js`

```js
useSummaryQuery()           // useQuery(['summary'], getSummaryTask)
useSummaryByCategoryQuery() // useQuery(['summaryByCategory'], getSummaryTaskByCategory)
```

These are automatically fresh because task/category mutations already invalidate
`['summary']` and `['summaryByCategory']` in their `onSuccess`.

#### Components to update

| File | Change |
|---|---|
| `Summary.jsx` | Replace `dispatch(fetchSummary/fetchSummaryByCategory)` + `isSummaryUpdated` selector with two `useQuery` calls |
| `usePopup.jsx` | Remove all `dispatch(fetchSummary())` / `dispatch(fetchSummaryByCategory())` calls (invalidation in mutations handles it) |
| `CreateTask.jsx` | Same — remove summary dispatch calls |
| `taskDetail.jsx` | Same |

#### Redux changes

- Delete `summarySlice.jsx`
- Move `toggleInstructPopup` → `uiSlice` (new reducer + export)
- Move `instruction` state → `uiSlice` initialState
- Remove `summaryReducer` from `store.jsx`
- Update all `clearSummaryState` call sites (only `Logout.jsx` — replace with
  `queryClient.clear()` or specific key invalidation)

**Test gate:** `summarySlice.test.js` deleted; new `useSummary.test.js` added.

---

### 2E — User query

Replace `fetchUserData` thunk with TQ. Keep `loginUser`/`logoutUser` as RTK thunks.

#### New: `hooks/queries/useUser.js`

```js
useUserQuery() // useQuery(['user'], getUserData, { retry: false, enabled: ... })
```

#### Components to update

| File | Change |
|---|---|
| `AuthProvider.jsx` | Replace `dispatch(fetchUserData)` + local `initialCheckAttempted` state with `useUserQuery()`; use TQ's `isLoading`/`isError` directly |

#### Redux changes

Remove from `userSlice`:
- Thunk: `fetchUserData`
- extraReducers for `fetchUserData.fulfilled` / `fetchUserData.rejected`
- `loading` state can stay (still driven by `loginUser.pending`)

**Note:** `useUserQuery` result must still update `isAuthenticated`/`userData`
in Redux so all components that read `state.user` keep working. Options:
1. `useUserQuery` + an `onSuccess` that dispatches a new `setUserData` action
2. Leave `fetchUserData` as RTK thunk but have it call TQ's `queryClient.setQueryData`

Option 1 is cleaner. Add a `setUserData` reducer to `userSlice`.

Set `staleTime: 5 * 60 * 1000` and `retry: false` on `useUserQuery` to match
current one-shot fetch behavior and avoid background refetches on every window focus.

**Test gate:** 109+ tests. `authen.test.js` may need updates.

---

## Files created / modified / deleted summary

### New files
```
frontend/src/lib/queryClient.js
frontend/src/hooks/queries/useTasks.js
frontend/src/hooks/queries/useSummary.js
frontend/src/hooks/queries/useUser.js
frontend/src/__tests__/hooks/queries/useTasks.test.js
frontend/src/__tests__/hooks/queries/useSummary.test.js
```

### Modified
```
frontend/src/main.jsx                  (add QueryClientProvider)
frontend/src/redux/taskSlice.jsx       (slim to streakStatus only)
frontend/src/redux/userSlice.jsx       (remove fetchUserData thunk)
frontend/src/redux/summarySlice.jsx    → deleted; toggleInstructPopup → uiSlice
frontend/src/redux/uiSlice.jsx         (add instruction, toggleInstructPopup)
frontend/src/redux/store.jsx           (remove summaryReducer, streakMiddleware)
frontend/src/hooks/useFetchTask.jsx    (replace with TQ)
frontend/src/hooks/usePopup.jsx        (replace dispatches with mutations)
frontend/src/components/task/CreateTask.jsx
frontend/src/components/task/taskDetail.jsx
frontend/src/components/task/GroupTaskForm.jsx (remove isSummaryUpdated reads if any)
frontend/src/components/layout/Sidebar.jsx
frontend/src/components/forms/SearchField.jsx
frontend/src/components/dashboard/Summary.jsx
frontend/src/components/auth/AuthProvider.jsx
frontend/src/components/auth/Logout.jsx
frontend/src/components/feedback/TaskErrorToast.jsx
```

### Deleted
```
frontend/src/redux/summarySlice.jsx
frontend/src/__tests__/redux/summarySlice.test.js  (replaced by useSummary.test.js)
```

---

## Definition of Done

- `npm test` passes all tests (new count: ≥ 109)
- `npm run lint` passes
- No Redux thunks remain except `loginUser` / `logoutUser`
- No `dispatch(fetchX)` calls remain in components (only `dispatch(loginUser/logoutUser)`)
- `isSummaryUpdated` and `lastStateUpdate` fields are gone from Redux state
- `summarySlice` is deleted

---

## Risk notes

- **Interceptor — no changes needed:** `axiosConfig.js` dispatches only
  `store.dispatch(logoutUser())` on failed refresh — `logoutUser` is kept as an
  RTK thunk. The interceptor does NOT call `fetchUserData` at any point
  (confirmed by `axiosConfig.test.js`). Zero interceptor changes required.
- **MIN_LOADING_MS splash delay:** Currently in `userSlice`'s `loginUser` thunk
  via `minimumLoading()`. Since `loginUser` stays as an RTK thunk, this is
  untouched.
- **Test rewrite scope:** `useFetchTask.test.jsx` needs a full rewrite (TQ
  wrapper instead of Redux wrapper). `summarySlice.test.js` is deleted.
  Component tests that mock `useSelector` for summary/task state need updating.
