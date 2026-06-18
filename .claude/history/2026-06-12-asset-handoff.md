# Handoff — SlimeList Asset & UI Session (2026-06-12)

## Project
SlimeList — `C:\Users\Time\documents\projects\slimelist`
Monorepo: `frontend/` (React + Vite) · `server/` (Express + MongoDB)

## Current State

### Completed
- Phase 1: Pet core backend (EXP, happiness, evolution, daily decay cron)
- Phase 2: Pomodoro timer with pet rewards

### Active Plan
**Phase 3 — UI Redesign (Pet-First)**
See `.claude/plans/active.md` for full build order.
Key prereq: TanStack Phase 2D cleanup (step 0) — delete dead `DashboardTab.jsx`, `summarySlice`, store registration.

### Asset Work (NOT started — blocked on UI shell)
The user is preparing to create slime pet assets. No asset files exist yet. Temp placeholders are the existing PNGs in `frontend/public/images/`.

---

## Asset Decisions Locked (grilling session)

| Decision | Choice |
|---|---|
| Sequencing | UI shell (Phase 3) first — assets after Pet component contract is locked |
| Pet display size | 256×256 fixed box, CSS `object-fit: contain` |
| Pet animation tool | **Rive** (user's first time — timebox learning to 1 day) |
| UI chrome animation | Framer Motion (already in codebase) |
| Final asset format | Rive `.riv` — NOT SVG or sprite sheet |
| Temp placeholders | `Logo-slime.png`, `Bronze-slime.png`, `Silver-slime.png`, `Gold-slime.png` → map to egg/baby/teen/adult |
| Rive source location | `design/slime.riv` (committed to repo) |
| Rive runtime location | `frontend/public/` |

### Animation split
| What | Tool |
|---|---|
| Slime body + character states | Rive state machine |
| Emote popups (heart, level_up) | Framer Motion |
| UI feedback (EXP bar, reward toast) | Framer Motion |

---

## Still Unresolved (pick up here)

1. **Rive state machine names** — proposed: `idle`, `happy`, `sad`, `celebrate` — needs confirmation
2. **Expression layers** — are facial expressions Rive states inside the same `.riv`, or separate overlay assets?
3. **Art style** — pixel art / smooth vector / painterly — not decided
4. **Rive learning outcome** — user will report back after day-1 timebox

---

## Key References

- Active plan: `.claude/plans/active.md`
- Asset roadmap: `.claude/assets/ASSET_ROADMAP.md`
- Gamification constants: `.claude/docs/GAMIFICATION_SYSTEM.md`
- Pet component contract (not yet built): must accept `evolutionStage` and `happiness` as props
- Existing temp assets: `frontend/public/images/`

---

## Suggested Skills

- `/grill-me` — continue grilling on unresolved asset decisions once user reports back from Rive
- `/scrutinize` — review the Pet component design before implementation
- `/verify` — confirm Rive runtime renders correctly in the browser after integration
- `/task-done` — run after Phase 3 UI shell steps complete
