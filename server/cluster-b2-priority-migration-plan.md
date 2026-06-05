# Cluster B #2 — Tag-collection → `priority` field migration

## Context

"Tag" in SlimeList is **not** freeform tags — it's the task **priority** system (`low | medium | high`).
Today it's modelled as a separate `Tag` MongoDB collection, with `Tasks.tag` as a required ObjectId
ref. This implementation was never finished and is quietly broken in several ways:

- **`Tasks.js:35`** declares `require: true` — a typo (not `required`). Mongoose silently ignores it,
  so `tag` is effectively optional. This is *why* creation doesn't 500 despite the next bug.
- **`service.js createTask` never reads `tag`** (line 144 destructure omits it). Every task is created
  with **no priority at all**; `getTasksFlat` falls back to `tagName: "low"`.
- **Sort is dead** (`service.js:137`): compares `a.tag` (an ObjectId) against `PRIORITY_ORDER`, and
  `PRIORITY_ORDER = ["High","Medium","Low"]` is capitalised while the enum is lowercase — never matches.
- Frontend priority UI was never shipped: `functions/tag.js` is fully commented out, the picker in
  `taskDetail.jsx` is commented out, `CategoryTagField`'s `showTag` is never `true`. `CreateTask.jsx:105`
  hardcodes `tag: "low"` as a plain string.

**Reframe (post-scrutiny):** priority has *never functioned* — create dropped it, sort was dead, and
there is **no UI to set it** (zero navigation to `/tag`, picker commented out). So this is effectively
**building the backend for a priority feature**, not migrating a working one. Consequences that shrank
the plan: there is almost nothing to back-fill, and the `/tag` routes + the `tag` query-param filter have
**no callers** — they are dead code to delete, not contracts to rename.

**Goal:** dissolve the `Tag` collection and model priority as a string-enum field named `priority`
directly on `Tasks` (mirroring `status`). Fix the create/update/sort logic so priority actually works.
Delete dead frontend/backend tag code. Default existing docs to `low` and drop the collection.

**Decisions (confirmed with user):** field name = `priority`; frontend = **cleanup only** (no new picker
this round); data = **one-shot script defaulting to `low`**.

## Scope at a glance

Backend touch-points are tiny — only 4 files reference Tag (`Tag.js`, `Tasks.js`, `service.js`,
`helperController.js`); the Tag controller/routes were already deleted in Cluster A. Frontend real
touch-points: `CreateTask.jsx`, `taskDetail.jsx`, `functions/tag.js`, plus the dead `/tag` route pair
(`Tag.jsx`, `TagList.jsx`) — all deletions. No existing Jest/Vitest test references Tag, so nothing
breaks — but we add coverage for the new create/sort path.

---

## Phase 1 — Backend: schema + constants (TDD)

**Files:** `server/Models/Tasks.js`, `server/shared/utils/taskConstants.js`

1. `taskConstants.js`: add `PRIORITIES = ["low","medium","high"]`; **fix** `PRIORITY_ORDER` to lowercase
   and to highest-first sort order: `["high","medium","low"]`. Export both.
2. `Tasks.js`: replace the `tag` ObjectId-ref block with:
   ```js
   priority: { type: String, enum: PRIORITIES, default: "low" }
   ```
   (import `PRIORITIES` alongside the existing `TASK_STATUSES` import — drop the broken `require: true`.)

**Test (new):** add `server/test/taskConstants.test.js` asserting `PRIORITY_ORDER` sorts high→low and
matches the enum casing (guards the exact bug that made sort dead).

**Verify:** `npm test` green; server boots (`node -e "require('./Models/Tasks')"` clean).

## Phase 2 — Backend: service create / update / sort

**File:** `server/modules/task/service.js` (and drop `const Tag = require(...)` import)

- **createTask:** destructure `priority` from `data`; add `priority: PRIORITIES.includes(priority) ? priority : "low"`
  to the `newTask` object. (This is the path that was completely dropped before.)
- **updateTask:** replace the `final.tag` block (lines 236, 253-259 — the `Tag.findOne` lookup) with a
  plain enum field: `priority: updateData.priority || existing.priority || "low"`, validated against
  `PRIORITIES` (mirror the existing `status` validation at line 265).
  - **Why the `|| "low"`:** `repository.findTask` (repository.js:7) is a hydrated `findOne` (no `.lean()`),
    so Mongoose applies the schema `default: "low"` to docs missing the field — `existing.priority`
    resolves to `"low"`, not `undefined`, and the enum check won't 400. The explicit `|| "low"` makes
    that belt-and-suspenders instead of resting on an implicit hydration detail.
- **Reads:** in `getTasksFlat` (and `getTasksGroupedByDeadline`) drop the `{ path: "tag" }` populate.
  In `getTasksFlat` map, use `task.priority` directly (no `task.tag?.tagName` fallback needed).
- **Sort fix (`getTasksFlat:134-138`):** `return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)`.

**Test (new):** extract the flat-list comparator to a **named exported function** (e.g.
`compareTasksForFlatList`) and unit-test it directly — status first, then priority high→medium→low, plus
a task missing `priority` sorting as `low`. (Commit to extraction; don't leave it inline + untestable.)

**Verify:** `npm test` green.

## Phase 3 — Backend: controller filter + dead-code removal

**Files:** `server/modules/task/controller.js`, `server/controllers/helperController.js`,
`server/Models/Tag.js`

- **controller `getTask`:** **delete** the `tag` query-param filter block (lines 52-59) outright. It has
  no caller (the only consumer, `TagList.jsx`, is being deleted in Phase 4 and nothing navigates to it).
  Don't rename it to a `priority` filter — that would just be a different dead branch. If a priority
  filter is wanted later, it's a deliberate feature, not part of this cleanup.
- **`helperController.js`:** delete the unused `processTags` export (dead since Cluster A).
- **Delete `server/Models/Tag.js`** — nothing in app code references it after Phases 1-2 and the filter
  removal above (verify with a final grep). **Note:** delete the model *after* the Phase 5 script runs,
  or have the script read the raw `tags` collection instead of the model (see Phase 5).

**Verify:** `npm test` green; `grep -ri "Tag" server --include=*.js` (excluding node_modules) returns
nothing in app code; server boots.

## Phase 4 — Frontend cleanup (separate workspace — own commit)

**Files:** `CreateTask.jsx`, `taskDetail.jsx`, `functions/tag.js`, `App.jsx`,
`user/Tag.jsx`, `user/TagList.jsx`, `CreateEntity.jsx`

- **`CreateTask.jsx:105`:** rename the sent field `tag` → `priority` (keep the `"low"` default string).
- **`functions/tag.js`:** delete the file (entirely commented-out dead code; endpoint already gone).
- **`taskDetail.jsx`:** delete the commented-out "Tag is on process" picker block (~lines 271-290) and any
  now-dead `tags`/`handleToggleTag` references.
- **Dead `/tag` routes — delete both.** Confirmed unreachable: nothing in the app navigates to `/tag` or
  `/tag/:tagName` (sidebar links go to `/`, `/upcoming`, `/all-tasks`, `/category`, `/settings`). Remove
  both `<Route>`s + lazy imports in `App.jsx`, and delete `user/Tag.jsx` and `user/TagList.jsx`. No filter
  rename needed — there was no live caller to preserve.
- **`CreateEntity.jsx:21`:** copy string only ("Category and tag cannot be...") — leave or reword; no logic.

**Test:** update/confirm Vitest green (no test references tag today; add one asserting CreateTask sends
`priority`).

**Verify:** `npm run build` + `npm run lint` clean; manual smoke per Verification below.

## Phase 5 — Data migration (one-shot script)

**File:** `server/scripts/migrate-tag-to-priority.js` (new, standalone)

Because create never wrote `tag`, virtually all existing tasks have **no** tag at all — so this is mostly
a default-and-unset, not a real ObjectId→string remap. Keep it dead-simple:

- Connect via the same env-loading pattern as `server.js` (`.env.${NODE_ENV}`).
- **Read the legacy `tag` via the raw collection**, not the `Tag` model — the model is being deleted
  (Phase 3). For each task: if a legacy `tag` ObjectId exists, resolve its name from
  `db.collection("tags")` and set `priority` to it; otherwise set `priority: "low"`. Then `$unset tag`.
  (If we'd rather not touch the `tags` collection at all, just set every missing `priority` to `"low"`
  and `$unset tag` — given the data reality, this loses almost nothing. Decide at run time from the dry-run counts.)
- Idempotent: skip docs that already have a valid `priority`.
- Print a summary (counts remapped / defaulted / skipped). **Dry-run flag** (`--dry`) that logs without
  writing. Run against dev Atlas first; prod only if it holds real data.
- **Ordering:** run this script *before* deleting `Models/Tag.js`, or rely solely on the raw-collection
  read so order doesn't matter.

**Verify:** run `--dry` against dev, eyeball counts, then live run; spot-check a few docs in Atlas.

---

## Verification (end-to-end)

1. **Backend:** `cd server; npm test` — all green after each phase (baseline 25).
2. **Boot:** `npm run dev:local` (or `npm run dev`) — server starts, no missing-module errors.
3. **Create path:** POST a task with `{ priority: "high" }` → persisted with `priority: "high"`
   (previously dropped entirely). POST without priority → defaults `"low"`.
4. **Update path:** PUT `{ priority: "medium" }` → updates; invalid value → 400.
5. **Sort:** GET flat list with mixed priorities → ordered status-first, then high→medium→low
   (previously unsorted — this proves the dead-sort bug is fixed).
6. **Filter:** GET `/task?priority=high` → only high-priority tasks.
7. **Frontend:** `npm run build && npm run lint` clean; create a task in the UI → network shows
   `priority` in the payload; task detail renders without the removed dead block.
8. **Migration:** `node scripts/migrate-tag-to-priority.js --dry` then live; Atlas spot-check.

## Risk / sequencing notes

- **One workspace at a time** (root CLAUDE.md): finish + commit backend (Phases 1-3, 5) before frontend
  (Phase 4), or vice-versa — don't interleave commits. Unlike #1, there is **no live cross-workspace
  contract** to keep in lockstep here: the only place the old `tag` query-param was consumed
  (`TagList.jsx`) is being deleted, and create's `tag`→`priority` payload rename is on a path the backend
  was already ignoring. So the two workspaces can land in either order without a broken intermediate state.
- No integration tests for task/streak (see `server/backend.md` §Risk Register) — lean on the new unit
  tests + manual smoke for the service changes.
- Pre-existing unrelated working-tree changes (frontend/docs/daily-logs) must **not** be committed with
  this work.
- Update `server/HANDOFF-bugfixes.md` (mark #2 done) and the relevant `MIGRATION.md` at phase-end per the
  workflow handshake.
