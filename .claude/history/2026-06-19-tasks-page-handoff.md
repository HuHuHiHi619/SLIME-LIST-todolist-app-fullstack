# Handoff — Tasks Page Redesign (Phase 3 Step 3)

**Date:** 2026-06-19  
**Branch:** `phase3/tasks-redesign` (off `main`)

## What was done

Built the unified `/tasks` page replacing 4 old routes (`/all-tasks`, `/upcoming`, `/category`, `/category/:categoryName`). Old routes redirect to `/tasks`.

**Files created:**
- `frontend/src/pages/TasksPage.jsx` — page shell, filter state, task rows, portals
- `frontend/src/components/tasks/TaskFilters.jsx` — priority + status chips, sort dropdown, count bar
- `frontend/src/components/tasks/TasksSidebar.jsx` — Overall Progress donut + By Category bars

**Files modified:**
- `frontend/src/App.jsx` — replaced 4 routes with `/tasks` + `<Navigate>` redirects

**Files deleted:**
- `AllTask.jsx`, `Upcoming.jsx`, `Category.jsx`, `CategoryList.jsx` (views)
- `GroupTaskForm.jsx`, `TaskForm.jsx` (task components)

### Filter section polish (this session)

`TaskFilters.jsx` was redesigned to match `filter.png`:

- **Layout**: Single box → two side-by-side `rounded-2xl border-2` boxes (PRIORITY left, STATUS right) + loose count/sort row below
- **Priority dots**: Colored `w-2 h-2 rounded-full` dot before inactive High (red `#E2553D`), Medium (amber `#E0A53A`), Low (mint `#2BB795`). Dot hidden when chip is active.
- **Priority active bg**: Active High/Medium/Low chips use their priority color as `backgroundColor` (inline style). Active "All" uses `bg-purpleBorder` (purple). Status chips all use `bg-purpleBorder`.
- **Count display**: Active chips keep `bg-white/20` badge inside the pill. Inactive chips show plain `text-xs text-gray-400` count (no pill bg).
- **Inactive chips**: Borderless — removed `border border-purpleNormal` ring.
- **Count numbers**: `text-[#A88BFF]` (soft violet = `--violet-ink` per UI_TOKENS). Note: `--violet-ink` is a docs token only, not a real CSS var — hardcoded hex is intentional.

## What's NOT done yet

1. **`/task-done` ritual not run** — `UX_UI_ARCHITECTURE.md` still says the old task page spec. Needs update to reflect the new single-page filter design. Active plan (`active.md`) still shows step 3 as IN PROGRESS.
2. **Navbar redesign** (`phase3/navbar-redesign`, other session) — user said it's OK and will fix later. When merged, the nav link to `/tasks` should already work since the navbar uses that path.
3. **No commit yet** on `phase3/tasks-redesign`.

## Verified

Page renders at `/tasks`: header, PRIORITY/STATUS filter chips, sort dropdown, Overall Progress donut sidebar, empty state. No JS errors. Old routes redirect correctly.

Filter bar: two-box layout, colored dots, priority-colored active chips, inline counts.

Task list rows: styled circular checkbox, priority/category/deadline badges, subtask progress bar, EXP + Coin pills.

## Session 2 — Task list row polish (2026-06-19)

`TasksPage.jsx` `TaskRow` was redesigned to match `tasklist.png`:

- **Coin pill**: Added `COIN_BY_PRIORITY = { high:20, medium:10, low:5 }` constant. Renders amber bordered pill (`border-amber-500/60 bg-amber-500/10 text-amber-300`) with solid amber dot icon right of EXP pill. Restores ~65/35 left/right layout balance.
- **Checkbox**: Replaced native `<input type="checkbox">` with `w-5 h-5 rounded-full border-2` styled button. Pending = gray border hover-white. Completed = `border-green-400` + check icon (9px). Failed = `border-red-500` + X icon (9px). `mt-1` offset removed — checkbox now aligns to title baseline naturally.
- **Category chip**: Wrapped in `bg-white/5 rounded-full px-2 py-0.5` pill bg.
- **Subtask copy**: Changed `{n}/{m} subtasks left` → `{n} of {m} subtasks left`.
- **Dead guard**: Removed `e.target.type === "checkbox"` from row click handler (no input element remains).

## Session 3 — Sidebar polish (2026-06-19)

`TasksSidebar.jsx` redesigned to match `overall-progress.png`:

- **Single card**: merged the two separate `rounded-2xl` cards (Overall Progress + By Category) into one unified card.
- **Donut centered**: removed dead `flex items-center gap-6` wrapper from `ProgressDonut` (was a placeholder for the omitted Earned Today stats); call site wraps donut in `<div className="flex justify-center">`.
- **Divider**: `<hr className="border-purpleNormal mt-4 mb-4" />` separates donut from BY CATEGORY section; only renders when categories exist.
- **Earned Today**: remains omitted — no per-day aggregation endpoint exists.

## Next actions

1. Run `/task-done` to update `UX_UI_ARCHITECTURE.md` and archive active plan.
2. Commit `phase3/tasks-redesign`.
3. Open PR → `main`.

## Key design decisions

- EXP pill per task: derived from `EXP_BY_PRIORITY` constant (`high=50, medium=25, low=10`), no backend call.
- Coin pill per task: derived from `COIN_BY_PRIORITY` constant (`high=20, medium=10, low=5`), no backend call. Previously omitted; added to restore right-side layout balance (design shows both pills on every row).
- "Earned Today" sidebar panel: omitted (no per-day aggregation endpoint).
- Filtering: client-side from flat `GET /task` response (no backend priority filter param).
- Priority active bg uses inline `style` not Tailwind class — dot color is dynamic, can't be a static class.
- `--violet-ink` (`#A88BFF`) hardcoded as hex; the CSS var is documentation-only and not in any stylesheet.

## References

- Active plan: `.claude/plans/active.md`
- Design mockups: `.claude/designs/filter.png`, `.claude/designs/tasklist.png`, `.claude/designs/overall-progress.png`
- Plan file: `.claude/plans/read-claude-plans-active-md-claude-desig-linear-sprout.md`
