# Active Plan — Phase 3 (revised): UI Redesign, Pet-First

_Agreed via grilling session, 2026-06-12. Reorders SLIME_PROGRESSION build order: Dashboard Redesign (step 4) is pulled ahead of Phase 2 Emotional Attachment (step 3) because the latter requires new assets and this phase creates **no assets**._

## Scope
Same theme, all pages restructured. No new asset files. No backend changes (one exception: none — "daily mission" and "buff & progress" are re-presentations of existing systems: today's tasks, streak + `getStreakMultiplier` EXP buff, evolution progress).

## Design source
A desktop-only visual prototype exists outside the repo. When ready, screenshots + spec doc land in a `design/` folder in this repo. Prototype is a **visual spec only** — no code import. Mobile layouts are derived per-page during build (stacking), approved in the running app; mobile is part of each page's definition of done.

## Decisions
- **Navigation:** Sidebar is killed. Navbar carries: Dashboard | Tasks | Pet | Pomodoro. Settings moves into the avatar/expand menu next to Logout.
- **Dashboard:** Big pet screen · daily mission (today's tasks, with quick-add) · character stat · buff & progress (streak days, EXP multiplier, evolution progress). Old widgets (StreakField, Summary) map into these panels per spec.
- **Badges:** killed in the UI (BadgeField removed from dashboard). Backend badge logic/fields untouched. Record as a small ADR when removed.
- **Pet visuals:** no pet assets exist in repo. Temp: reuse `frontend/public/images/Logo-slime.png` + existing Framer Motion patterns (`SlimePortal.jsx`). Pet component must take `evolutionStage`/`happiness` as props from day one so real assets later are a drop-in.
- **Tasks page:** merges AllTask / Upcoming / Category routes into one filtered page (already prescribed by UX_UI_ARCHITECTURE.md).
- **Pet page:** brand-new view (does not exist today) — all pet detail. UI-only.
- **Guest mode:** full access on all redesigned pages (existing rule, unchanged).

## Build order (one shippable PR each)
0. **Prereq:** TanStack Phase 2D — ✅ DONE (rolled into step 2). Deleted: DashboardTab, BadgeField, PetPanel, StreakField, Summary. summarySlice was already absent.
1. **Shell:** new navbar (4 items + avatar menu), kill sidebar; existing routes still work.
2. **Dashboard:** 🔄 IN PROGRESS — branch `phase3/dashboard-redesign`. 4 panels built. 5 bugs fixed (axiosConfig loop, userSlice.rejected, bar anchoring, state.task→state.tasks typo, empty-message/streak-dot). Visual issues pending final `/verify` approval. See `.claude/history/2026-06-18-dashboard-handoff.md`.
3. **Tasks merge:** 3 routes → 1 page with filters.
4. **Pet page:** new view.

After each step: update UX_UI_ARCHITECTURE.md to match reality.

## Not in this phase
New assets · daily-mission/buff backend systems · Phase 3 customization (inventory/coins) · badge backend removal.
