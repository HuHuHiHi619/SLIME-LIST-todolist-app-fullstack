# Plan Queue

Planned phases after the active plan completes. Ordered by priority.

---

## Phase 2 — Pomodoro Integration

Per `.claude/docs/UX_UI_ARCHITECTURE.md` roadmap. Pomodoro completion → +5 happiness, +20 EXP → pet happy → task EXP bonus.

---

## Phase 3 — Cosmetic Unlocks / Inventory

Per `.claude/assets/ASSET_ROADMAP.md`. Coin system, inventory, costume slots (Head, Face, Back). Layer system: body/ + head/ + face/ composed on frontend.

---

---

## Housekeeping / Parked

- **#22 Orphan task** — Guest task `PASS-create-*` left in dev Atlas from a verify run (guest cookie gone, not deletable via UI). Drop it next time you're in the dev Atlas console.
- **Prod data** — Prod Atlas `slimelist` is empty. Verify `MONGO_URI` in `.env.production` points to the correct cluster before any real-user deploy. Pre-deploy checklist item.
- **Dependabot** — GitHub reports vulnerabilities on the default branch. Not yet triaged — separate track.
- **Lint warnings** — `npm run lint` passes with 69 warnings (legacy unused `React` imports). Not blocking; new code must stay error-free.

---

## Frontend Audit (not yet done)

`components/pages/ui/`, `animation/`, `user/` (`Home`, `AllTask`, `Upcoming`, `Category`, `Sidebar`, `Navbar`, date pickers, `ProgressField`, `Summary`) — none of these have been audited. Schedule a full pass before Phase 3.

---

## Backend note 
- are startDate and deadline necessary?

_Add new phases here. Move to active.md when starting._
