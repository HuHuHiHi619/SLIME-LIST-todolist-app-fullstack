# Handoff — Backend Cleanup

**Updated:** 2026-06-06
**Status:** Cluster A complete. Cluster B COMPLETE (#1 + #2, backend + frontend).
Remaining: prod data migration not yet run; b2 branch in PR review.

The original six-bug run was split into two clusters by blast radius. The single source of truth for
bug details is `server/backend.md` §"Bug Fix Plan" — read it, don't duplicate.

## Cluster A — DONE

Branch `fix/backend-a1-deadcode-cleanup`, 3 commits, **25/25 Jest green** after every step,
route require-graph verified clean (server boots). Five bugs resolved:

- **#1** `helperController.js:40` `process.totalSteps` → `progress.totalSteps` — `fb83e94`
- **#2** `task/controller.js:59` removed spurious `()` in `new Types.ObjectId(t)` — `fb83e94`
- **#3** `user/service.js:79` dropped `"10m"`, uses default 15m — `fb83e94`
- **#5** deleted dead `TagController.js` + `tagRoutes.js` (`POST /api/tags`) — `895bfd1`
- **#6** deleted broken `utils/notification.js` + `notificationRoute.js` + the `getNotifications` call — `37cc33e`

**Kept intact on purpose:** `Tag` model + task `tag` field; the `notification` user setting, `Notification`
model, and `User.notifications` array (dormant foundation for a real notification feature).

## Cluster B — DONE (full-stack, frontend-coupled)

1. **Delete the retry feature (#4) end-to-end.** `tryAgainTask` was never implemented;
   `PUT /user/:id/attempt` 500s today.
   - **Backend — DONE** (branch `fix/backend-b1-retry-deletion`, 25/25 Jest green, require-graph clean).
     Removed: the `PUT /user/:id/attempt` route + import in `Routes/auth.js`; the `updatedTaskAttempt`
     handler + its now-dead `date-fns`/`repository` imports in `modules/task/controller.js`; `retryTask`
     (fn + export + `tryAgainTask` import) in `modules/task/service.js`; dead `findTaskById` in
     `modules/task/repository.js`; `Models/TryAgainHistory.js` (deleted); the `tryAgainCount` field on
     `Models/Tasks.js`. **Kept** the `"failed"` status + `TASK_STATUSES` (overdue cron still produces it).
   - **Frontend — DONE** (same branch `fix/backend-b1-retry-deletion`, commit `aefb743`, 67/67 Vitest
     green). Removed: the "Try Again" button + `handleTryAgainTask` + FontAwesome (`faRotateLeft`) imports
     in `taskDetail.jsx`; the `updatedTaskAttempt` thunk + its `extraReducer` case + `tryAgainCount` from
     `formTask` initial state in `redux/taskSlice.jsx`; `updateTaskAttempt` in `functions/task.js`; and its
     test. Endpoint + UI now removed together — no gap on `main`.

2. **Tag-collection → `priority` field migration — DONE** (branch `fix/backend-b2-priority-migration`,
   3 commits; 31 Jest + 67 Vitest green; plan: `server/cluster-b2-priority-migration-plan.md`).
   "Tag" was the priority system (`low|medium|high`), and it never functioned — `createTask` dropped the
   field, the flat-list sort compared an ObjectId against a capitalised `PRIORITY_ORDER` (always 0), and
   no UI ever shipped to set it. So this was effectively *building* the priority backend, not migrating one.
   - **Backend — DONE** (`915a2b0`). `priority` string-enum field on `Tasks` (default `low`, mirrors
     `status`). `taskConstants`: added `PRIORITIES`, fixed `PRIORITY_ORDER` to lowercase/highest-first.
     `service.js`: createTask now persists priority; updateTask validates it as a plain enum (no more
     `Tag.findOne`); extracted + fixed the dead sort into exported `compareTasksForFlatList`. Deleted
     `Models/Tag.js`, dead `processTags`, and the no-caller `tag` query-param filter. New tests:
     `test/utils/taskConstants.test.js`, `test/task/flatSort.test.js`.
   - **Frontend — DONE** (`baa272c`, cleanup-only). `CreateTask` sends `priority`. Deleted the dead
     `/tag` routes + `Tag.jsx`/`TagList.jsx` (unreachable — no nav links), `functions/tag.js`, and the
     commented-out picker in `taskDetail.jsx`. **No priority picker shipped** — users still can't set
     priority (create defaults to `low`); the picker is a clean follow-up feature.
   - **Data migration** (`959713a`). `scripts/migrate-tag-to-priority.js` — idempotent, `--dry` flag,
     operates on the raw driver collection (so it can `$unset` the now-off-schema `tag`). **Dev Atlas
     migrated** (4 tasks → `low`; 0 legacy tag docs/refs existed). **Prod NOT yet run** — run
     `NODE_ENV=production node scripts/migrate-tag-to-priority.js --dry` first, eyeball counts, then live.

### Follow-up (not part of Cluster B)

- **Priority picker UI.** Backend fully supports `priority` now; add a low/med/high selector in
  `CreateTask` + `taskDetail`, wired to the `priority` field. Own session.

## Workflow reminders (root CLAUDE.md)

- Plan Mode first; confirm before editing; one phase at a time; one workspace at a time.
- Run `npm test` (31 tests) after each step. No integration tests for task/streak — see
  `server/backend.md` §Risk Register before touching `service.js`.
- Read the `server-patterns` project skill before editing modules.
- Pre-existing unrelated working-tree changes (frontend/docs/daily-logs) — do not commit with backend work.
