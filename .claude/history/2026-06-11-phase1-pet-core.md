Completed: 2026-06-11

# Active Plan — Phase 1: Pet Core

**Goal:** Ship the core pet loop. Complete Task → EXP + Happiness → Level Up → Evolution.

## Progress

| Phase | Name | Status |
|-------|------|--------|
| 1A | Remove badge system | ✅ Done |
| 1B | Create Pet model + module | ✅ Done |
| 1C | Wire task completion → pet reward | ✅ Done |
| 1D | Daily happiness decay cron job | ✅ Done |
| 1E | Frontend: petSlice + usePetQuery | ✅ Done |
| 1F | Dashboard pet display (scaffold) | ✅ Done |
| 1G | Task completion → pet reward feedback | ✅ Done |
| 1H | Tests | ✅ Done |

---

## Phase 1H — Tests

### New file: `server/test/pet/petHelpers.test.js`

Cover: `applyExp` level-up threshold, `calcEvolutionStage` all four gates, `getStreakMultiplier` all five breakpoints, happy buff, `awardTaskReward` integration. Target ~15 new tests.

**Checkpoint:** `npm test` — all tests green.

---

## Deferred Fixes

All resolved.

---

## Implementation Notes (deviations from original plan)

- **1C** — used `formatUser` instead of `req.user?._id` (auth middleware sets `req.user.id`, not `._id`)
- **1E** — `petSlice` holds only `lastReward`; pet data fetched via TanStack Query (`usePetQuery`) not a Redux thunk — consistent with codebase pattern
- **Bugs fixed in session** — `CreateTaskSchema.deadline` missing `.nullable()`; `TaskForm` not passing `allTasks` to `TaskList`; toast `z-50` buried under popup `z-1001`; `invalidateQueries(["user"])` on task completion caused guest auth flash
