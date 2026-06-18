# Handoff — SlimeList Phase 3 Dashboard (2026-06-18)

## Branch
`phase3/dashboard-redesign` (off `main`)

## What was built

Step 0 (TanStack 2D) + Step 2 (Dashboard) of the active plan were combined into one PR.

### Deleted
- `frontend/src/components/dashboard/DashboardTab.jsx` — dead code, read undefined `state.summary`
- `frontend/src/components/dashboard/BadgeField.jsx` — returned null
- `frontend/src/components/dashboard/PetPanel.jsx` — replaced
- `frontend/src/components/dashboard/StreakField.jsx` — replaced
- `frontend/src/components/dashboard/Summary.jsx` — replaced

### Created (all in `frontend/src/components/dashboard/`)
- `PetStagePanel.jsx` — pet image, name, tier badge, level, EXP bar, Happiness bar, mood text
- `DailyMissionsPanel.jsx` — pending tasks as missions, EXP chip per priority, checkbox complete, + New mission CTA, task detail + create task portals
- `CharacterStatsPanel.jsx` — 5 stat boxes (Level/Happiness/Coins/Completed/Pomodoro) + evolution progress bar
- `ActiveBuffsPanel.jsx` — streak day card, streak EXP% buff card, happiness buff card

### Modified
- `frontend/src/components/views/Home.jsx` — rewritten to 4-panel layout
- `frontend/src/styles/layout.css` — `#home` → `grid-template-columns: 3fr 2fr`
- `.claude/docs/UX_UI_ARCHITECTURE.md` — dashboard section updated
- `frontend/frontend.md` — component map updated
- `frontend/src/Config/axiosConfig.js` — `/logout` added to interceptor exclusion (blocker fix)
- `frontend/src/redux/userSlice.jsx` — `logoutUser.rejected` handler added (blocker fix)

---

## Status: NOT APPROVED — visual issues partially resolved, `/verify` still pending

### ✅ FIXED — Infinite refresh/logout loop (`axiosConfig.js`)
`/logout` was not excluded from the 401 interceptor → `dispatch(logoutUser)` → `/logout` → 401 → loop.
**Fix applied:** added `originalRequest.url !== "/logout"` to the exclusion check.

### ✅ FIXED — Sign up button permanently disabled (`userSlice.jsx`)
`logoutUser.rejected` had no handler → if POST /logout failed, `loading` stayed `true` forever → Sign Up button stuck disabled.
**Fix applied:** added `.addCase(logoutUser.rejected, () => makeDefaultState())`.

### ✅ FIXED — EXP/Happiness bars not bottom-anchored (`PetStagePanel.jsx`)
Card had no min-height → `flex-1` on image div did nothing → bars floated mid-card.
**Fix applied:**
- Outer card div + skeleton: `min-h-[480px]` added
- Mood + both bars wrapped in `<div className="space-y-3">` — removes floated margins
- `♥` changed from `<span>` to `<p>` — `components.css span { color: gray-500 }` was overriding inline style
- Image div: `py-6` → `py-4` (handoff spec)

### ✅ FIXED — Streak card not appearing after task completion (`ActiveBuffsPanel.jsx`)
**Root cause:** `useCompleteTaskMutation` dispatches `setStreakStatus(data.user)` → updates `taskSlice.streakStatus`. But `ActiveBuffsPanel` was reading `userData.currentStreak` from `userSlice` — which is only populated at login and never updated after task completion. So streak stayed 0 until page reload.
**Fix applied:** `ActiveBuffsPanel` now reads:
```js
const { streakStatus } = useSelector((state) => state.task);
const streak = streakStatus?.currentStreak ?? userData.currentStreak ?? 0;
```
`taskSlice.streakStatus` is also persisted to `localStorage` via `writeStreakStatus`, so the streak survives page refresh.

### ❓ UNRESOLVED — Font sizes visually unchanged (`PetStagePanel.jsx`)
Classes are `text-6xl` (name) and `text-8xl` (level) — confirmed in source. Likely a `Jersey 10` pixel-font rendering constraint rather than a CSS bug. No code change made. Needs `/verify` → inspect element to confirm computed `font-size` values (`3.75rem` / `6rem`). If confirmed correct, accept as-is.

### ✅ FIXED (2026-06-18 session 2) — `state.task` typo (`ActiveBuffsPanel.jsx:39`)
`useSelector((state) => state.task)` → store key is `tasks` (plural). Crashed on mount with `TypeError: Cannot destructure property 'streakStatus' of undefined`.
**Fix:** `state.task` → `state.tasks`.

### ✅ FIXED (2026-06-18 session 2) — Empty-state message showing alongside streak card (`ActiveBuffsPanel.jsx`)
"Complete tasks daily to build your streak!" was gated on `!hasAnyBuff`, which is true for streaks < 3 days (below first buff tier). So a 1- or 2-day streak showed both the message and the streak card.
**Fix:** condition changed to `streak === 0 && !happyBuff`.

### ✅ FIXED (2026-06-18 session 2) — Streak dots flat color → fire gradient (`ActiveBuffsPanel.jsx`)
Filled dots used flat `#DE6F31`. Design uses the same fire gradient as the streak icon.
**Fix:** `backgroundColor: "#DE6F31"` → `background: "linear-gradient(to bottom, #FFDA93, #DEA331, #DE6F31, #783C1A)"`.

### ❓ UNRESOLVED — "there is issue" after streak dot fix (session 2 end)
User reported a remaining issue after the streak dot + empty-message fix but session ended before identifying it. Still needs `/verify` to surface what's wrong — not yet investigated in session 3.

### ✅ FIXED (2026-06-18 session 3) — DailyMissionsPanel gaps vs. design (`DailyMissionsPanel.jsx`)
Compared against `.claude/designs/daily-tasks.png`. Six issues closed:
1. **Subtitle EXP total** — was static "EXP"; now live `{totalExp} EXP` (sum of `EXP_BY_PRIORITY` across shown missions).
2. **"X left" count** — was `tasks.length` (all pending from query); now `missions.length` (capped-5 slice).
3. **Task title casing** — added `uppercase` class; design shows all-caps titles.
4. **Coin chip added** — new `COIN_BY_PRIORITY = { low: 5, medium: 10, high: 20 }` constant; gold pill `🪙 +N Coin` rendered per row (visual placeholder, no backend wiring).
5. **EXP chip style** — was border-only; now filled `bg-purpleNormal border border-purpleBorder`.
6. **Coin chip style** — `background: rgba(242,194,75,0.15)`, `border: 1px solid rgba(242,194,75,0.4)`, `color: #F2C24B` (`--gold` token value).
User visually approved. User also manually fixed a font — **use the font as reference for other panels** (inspect the running app to confirm which font/size was applied).

---

## Key verified facts
- **EXP to next level:** `(pet.level + 1) * 100` — from `server/modules/pet/helpers.js:29`
- **Daily Missions** = `useTasksQuery({ status: "pending" })` first 5 — no "today" filter in backend
- **Coins in DailyMissionsPanel:** `COIN_BY_PRIORITY = { low: 5, medium: 10, high: 20 }` — visual placeholder, not backend-wired
- **Coins in CharacterStatsPanel:** show `—` (coins stat box, not per-task rewards)
- **Pet images:** egg=`Logo-slime.png`, baby=`Bronze-slime.png`, teen=`Silver-slime.png`, adult=`Gold-slime.png`
- **Evolution bar:** `Math.min(Math.round((level / nextTierGate) * 100), 100)` — level-axis only
- **Streak data flow:** task complete → `taskService.toggleCompletion` → `result.userUpdate` → `data.user` → `setStreakStatus(data.user)` → `taskSlice.streakStatus.currentStreak`
- **Font:** user manually fixed a font in session 3 — inspect the running app on DailyMissionsPanel to confirm the applied font/size before touching other panels
- Design source: `.claude/designs/dashboard-main.png` + `dashboard-main2.png` + `daily-tasks.png`

## Panel-by-panel status

| Panel | File | Status |
|-------|------|--------|
| DailyMissionsPanel | `dashboard/DailyMissionsPanel.jsx` | ✅ Done — scroll fix added (session 5), fully approved |
| PetStagePanel | `dashboard/PetStagePanel.jsx` | ✅ Layout fixed (session 6) — visually approved by user, font unresolved (see note) |
| CharacterStatsPanel | `dashboard/CharacterStatsPanel.jsx` | ✅ Evolution removed (session 6) — visually approved by user |
| ActiveBuffsPanel | `dashboard/ActiveBuffsPanel.jsx` | ✅ Done — streak tier colors + accent subtitles approved (session 7) |

## Next steps
1. `npm run build` + `npm test -- --run` in `/frontend` (was 83/83 — re-run to confirm)
2. PR → main, then move to Step 1: Navbar redesign

---

### ✅ FIXED (session 6) — EXP and Happiness bars side-by-side (`PetStagePanel.jsx`)
Bars were stacked vertically (`space-y-3`). Design shows them as two columns.
**Fix:** Wrapped both bar divs in `<div className="grid grid-cols-2 gap-4">` inside the existing `space-y-3` wrapper — mood text stays above, bars sit side-by-side.

### ✅ FIXED (session 6) — Evolution section removed (`CharacterStatsPanel.jsx`)
Design does not show an evolution bar in CharacterStatsPanel (it lives in PetStagePanel only).
**Fix:** Removed the entire `{isAuthenticated && (...)}` evolution block. Cleaned up all orphaned code: `NEXT_TIER` constant, `nextTier`/`evolutionPct`/`stage` variables, and the full `useSelector` line (`userData` was also unused in this component). `gap-5` → `gap-4` on outer div.

---

### ✅ FIXED (session 5) — Mission list scroll when >4 items (`DailyMissionsPanel.jsx`)
List container capped at `max-h-[240px] overflow-y-auto pr-4`. With ≤4 tasks: no scrollbar. With 5: scrolls internally, panel height stays fixed, grid row no longer pushes CharacterStatsPanel/ActiveBuffsPanel down. `pr-4` gives breathing room between content and the scrollbar track.

---

### ✅ FIXED (session 4) — Task completion animation (`DailyMissionsPanel.jsx`)

Two-phase animation on task complete:
- **Phase 1 (0–600ms):** Row turns green (border + bg), full opacity. Green highlight transition: 300ms.
- **Phase 2 (600–1000ms):** Opacity fades to 0 over 400ms. Row removed when query refetch resolves after mutation.
- **Mutation fires at 1000ms** (after full animation).

**Key design decisions:**
- Two Sets in parent: `completing` (green) and `fading` (opacity-0). Separation ensures the opacity transition has a painted "from" state before `opacity-0` is applied — avoids the snap-to-invisible bug.
- `completing`/`fading` are **never cleared on success** — the row disappears when TanStack query refetch removes the task. Only cleared on mutation error (row snaps back to normal if backend fails).
- Spam-click guard: `!isCompleting` in button `onClick` prevents duplicate mutations during animation window.

### ✅ FIXED (session 7) — Streak tier color system (`ActiveBuffsPanel.jsx`)
Streak card icon box, dots, and border now shift color based on streak length:
- 1–6 days: orange (`#FFDA93 → #DE6F31 → #783C1A`)
- 7–13 days: blue (`#93E8FF → #31B3DE → #3176DE → #1A1F78`)
- 14+ days: purple (`#D993FF → #9631DE → #7C31DE → #361A78`)
Border uses `rgba` opacity variant of the mid-stop at 45%. `getStreakBuff` untouched — separate concern for EXP card visibility.

### ✅ FIXED (session 7) — EXP/happiness buff subtitles gray → amber accent (`ActiveBuffsPanel.jsx`)
"Active buff from your streak" and "Active buff from your happiness" were `text-gray-400` — indistinguishable from placeholder text. Changed to `style={{ color: "#D9925A" }}` (same amber as the `ACTIVE` badge) to signal live buff state. Casing normalized to lowercase "buff."

### ✅ FIXED (session 7) — Streak card subtitle conditional removed (`ActiveBuffsPanel.jsx`)
Was: `streak < 7 ? "Keep it alive" : "You're on fire"`. Design shows "Keep it alive — don't skip a day" at 7-day streak (7 < 7 is false → wrong branch). Fixed by always rendering "Keep it alive — don't skip a day" — tier color already communicates progression.

## Suggested skills
- `/verify` — run dev server + screenshot to confirm visual fixes match design
- `/code-review` — before committing
- `/task-done` — after PR merged (archives step 2, queues step 1)
- `/conventional-commit` — for final commit message
