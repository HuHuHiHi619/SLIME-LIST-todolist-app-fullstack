# Plan Queue

Planned phases after the active plan completes. Ordered by priority.

---

## Backlog — Pomodoro cooldown doesn't enforce minimum session duration

`helpers.js:5` — `POMODORO_COOLDOWN_MS = 60s`. Timer durations are localStorage-configurable with no server validation, so a user who sets `pomodoroWorkMin=1` earns rewards every 61 seconds (25× intended rate). Accepted "trust the client" tradeoff for now. Options: enforce minimum session duration server-side via POST body, or document the intentional gap.

---

## Phase 3 — Cosmetic Unlocks / Inventory

Per `.claude/assets/ASSET_ROADMAP.md`. Coin system, inventory, costume slots (Head, Face, Back). Layer system: body/ + head/ + face/ composed on frontend.

---

_Add new phases here. Move to active.md when starting._
