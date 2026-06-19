# Plan — Phase 3 Step 3: Tasks Page Redesign

## Context
Active plan step 3: merge AllTask / Upcoming / Category / CategoryList (4 routes) into one `/tasks` page with filter chips, enhanced task rows, and a right sidebar. Reference design: `.claude/designs/tasks-page.png`.

Design gaps resolved:
- **Coin rewards** → EXP pill only (⚡ +X EXP derived from priority: low=10, medium=25, high=50)
- **Earned Today** → omitted; sidebar shows Overall Progress donut + By Category only (no backend endpoint)

No backend changes.

---

## Branch
`phase3/tasks-redesign` — branch off `main` (not off navbar branch)

---

## Architecture

### Data fetching
- `useTasksQuery({})` — flat list, no groupBy params → backend returns all tasks for the user
- Priority counts (High N / Medium N / Low N) and status counts — computed client-side from the flat list via `useMemo`
- Status filter can also be sent server-side (`?status=pending`) but client-side is simpler since we already have all tasks
- Sidebar: `useSummaryQuery()` (key `["summary"]`) → `GET /summary/completed-rate` and `useSummaryByCategoryQuery()` → `GET /summary/completed-rate-by-category` — both hooks already exist

### Client filter state (local to TasksPage)
```js
const [priorityFilter, setPriorityFilter] = useState('all')  // 'all'|'high'|'medium'|'low'
const [statusFilter, setStatusFilter]     = useState('all')  // 'all'|'pending'|'completed'
const [sortBy, setSortBy]                 = useState('deadline')
```
Derived filtered+sorted list via `useMemo` from the full task list.

### Layout
Two-column: `flex gap-6` — task list column (flex-1) + sidebar (fixed ~380px). Sidebar hides on mobile (stacks below).

---

## Files

### Create
| File | Purpose |
|------|---------|
| `frontend/src/pages/TasksPage.jsx` | Page shell — holds filter state, portals (TaskDetail + CreateTask), two-column layout |
| `frontend/src/components/tasks/TaskFilters.jsx` | Priority chips + Status chips + Sort dropdown + "Showing X of Y" line |
| `frontend/src/components/tasks/TasksSidebar.jsx` | Overall Progress donut + By Category bars |

### Modify
| File | Change |
|------|--------|
| `frontend/src/components/task/TaskList.jsx` | Add priority badge, category badge, deadline badge, EXP pill, keep existing subtask bar. Each row remains a flat `<li>` — no structural change, just new inline elements. |
| `frontend/src/App.jsx` | Replace `/all-tasks`, `/upcoming`, `/category`, `/category/:categoryName` with single lazy `/tasks → TasksPage`. Update any nav links that point to old routes. |

### Delete
- `frontend/src/components/views/AllTask.jsx`
- `frontend/src/components/views/Upcoming.jsx`
- `frontend/src/components/views/Category.jsx`
- `frontend/src/components/views/CategoryList.jsx`
- `frontend/src/components/task/GroupTaskForm.jsx`
- `frontend/src/components/task/TaskForm.jsx`

---

## Key implementation notes

### EXP pill
```js
const EXP_BY_PRIORITY = { high: 50, medium: 25, low: 10 }
```
Derive from `task.priority` — no API call.

### Deadline badge
- No deadline → no badge
- Past deadline → red "Overdue Xd" with calendar icon
- Today → yellow/amber "Today"
- Tomorrow → "Tomorrow"
- Otherwise → formatted date string

### Priority badge colors (from UI_TOKENS)
Match the existing PriorityField token usage — `high` → red dot, `medium` → amber dot, `low` → teal dot. Text is the priority label capitalised.

### Overall Progress donut
SVG circle with `stroke-dasharray` — same pattern as dashboard panels. Show `completedTasks/totalTasks` fraction and `completedRate%` label.

### Category bars (sidebar)
Map `GET /summary/completed-rate-by-category` array. Each bar: colored dot + category name + `completedTasks/totalTasks · completedRate%` + `<div>` progress fill. Color per category via the existing category color field or a palette fallback.

### Portals
`TasksPage` mounts the two portals (`TaskDetail`, `CreateTask`) into `document.body` — same pattern as deleted `GroupTaskForm`.

### `+ New Task` button
Dispatches `setIsCreate(true)` to `uiSlice` — same as existing `CreateButton`.

---

## Routes to update in App.jsx
```jsx
// Remove:
{ path: '/all-tasks', element: <AllTask /> }
{ path: '/upcoming',  element: <Upcoming /> }
{ path: '/category',  element: <Category /> }
{ path: '/category/:categoryName', element: <CategoryList /> }

// Add:
{ path: '/tasks', element: <TasksPage /> }
```
Add redirects `<Navigate>` from old paths to `/tasks` in case any hardcoded links remain.

---

## Verification
1. `npm run dev` in `frontend/` — navigate to `/tasks`
2. All tasks load flat; Priority and Status chips filter correctly; counts update
3. Sort by Deadline reorders list
4. Click task → TaskDetail panel opens (unchanged)
5. `+ New Task` → CreateTask popup appears
6. Overall Progress donut matches `/summary/completed-rate` data
7. By Category bars match `/summary/completed-rate-by-category` data
8. Old routes (`/all-tasks`, `/upcoming`, `/category`) redirect to `/tasks`
9. Mobile: sidebar stacks below task list
10. `npm run lint` — no errors
