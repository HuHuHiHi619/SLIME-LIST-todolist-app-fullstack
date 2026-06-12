# Active Plan — Phase 2: Pomodoro Integration

## Decisions locked in
1. `pomodorosToday` stored on Pet document, reset by nightly cron
2. Guest support — same guestId path as tasks
3. Timer durations user-configurable — stored in `localStorage` (UI preference, no server needed)
4. Task linkage — Phase 2 only uses the existing happy buff; no explicit task linking

## Scrutinize fixes applied
- Step order corrected: schema (Pet model) before service function
- Nav link goes in `Sidebar.jsx`, not `Navbar.jsx`
- `currentStreak` source must be wired in the pomodoro controller (from JWT-decoded user or DB lookup)
- Test for `awardPomodoroReward` uses inline pure-logic pattern (like existing `awardTaskReward pure logic` block), not a DB-coupled service call
- Cron reset: extend `decayPetHappiness` to also zero `pomodorosToday` (already iterates all pets)
- Step 11: `DashboardTab` calls `usePetQuery()` directly to read `pomodorosToday`

## Steps

| # | What | File(s) | Done |
|---|------|---------|------|
| 1 | Add `pomodorosToday` field to Pet model | `server/Models/Pet.js` | [x] |
| 2 | Add `POMODORO_EXP=20`, `POMODORO_HAPPINESS=5` to helpers.js + `awardPomodoroReward` in service.js | `server/modules/pet/helpers.js`, `service.js` | [x] |
| 3 | Add `POST /api/pet/pomodoro` controller (wire `currentStreak` from `req.user?.currentStreak ?? 0`) + route | `server/modules/pet/controller.js`, `server/Routes/petRoutes.js` | [x] |
| 4 | Extend `decayPetHappiness` in cron to also zero `pomodorosToday` nightly | `server/job/cronJob.js` | [x] |
| 5 | Backend test — inline pure-logic block for pomodoro reward calc (no DB) | `server/test/pet/petHelpers.test.js` | [x] |
| 6 | `usePomodoroSession` hook — POST /api/pet/pomodoro, invalidate `['pet']` | `frontend/src/hooks/queries/usePomodoro.js` | [x] |
| 7 | `PomodoroTimer` component — work/break countdown, start/pause/reset, calls `onComplete` | `frontend/src/components/pomodoro/PomodoroTimer.jsx` | [x] |
| 8 | `Pomodoro` view — wraps PomodoroTimer, wires `onComplete` to session hook | `frontend/src/components/views/Pomodoro.jsx` | [x] |
| 9 | Wire route + add `SidebarLink` to Sidebar | `frontend/src/App.jsx`, `frontend/src/components/layout/Sidebar.jsx` | [x] |
| 10 | Pomodoro duration settings — add work/break inputs to Settings page (read/write localStorage) | `frontend/src/components/views/Settings.jsx` | [x] |
| 11 | Dashboard `pomodorosToday` counter — call `usePetQuery()` inside DashboardTab, read `data?.pomodorosToday` | `frontend/src/components/dashboard/DashboardTab.jsx` | [x] |
| 12 | Frontend hook test | `frontend/src/__tests__/hooks/queries/usePomodoro.test.jsx` | [x] |
