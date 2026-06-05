# Handoff — Backend Cleanup

**Updated:** 2026-06-05
**Status:** Cluster A complete. Cluster B pending (next session).

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

## Cluster B — TODO (full-stack, frontend-coupled — own session, use TDD)

1. **Delete the retry feature (#4) end-to-end.** `tryAgainTask` was never implemented;
   `PUT /user/:id/attempt` 500s today.
   - Backend: route in `Routes/auth.js` (`updatedTaskAttempt`), the `updatedTaskAttempt` handler in
     `modules/task/controller.js`, `retryTask` in `modules/task/service.js`, and `Models/TryAgainHistory.js`.
   - Frontend: "Try Again" button in `taskDetail.jsx:188`, the `updatedTaskAttempt` thunk in
     `redux/taskSlice.jsx`, `updateTaskAttempt` in `functions/task.js`, and its test.
   - Decide whether the `tryAgainCount` field / `"failed"` status stay (the `failed` status is still
     produced by the overdue cron — likely keep it; `tryAgainCount` becomes dead — optional removal).

2. **Tag-collection → `priority` field migration.** "Tag" is the priority system (`low|medium|high`),
   not freeform tags. **Keep priority, dissolve the collection**: add a `priority` string-enum field to
   the `Tasks` schema (like `status`), delete the `Tag` model/route plumbing, update task
   service create/update/sort (`PRIORITY_ORDER`), update ~12 frontend tag files, and write a data
   migration for existing tasks holding `Tag` ObjectId refs. Frontend already sends `tag` as a plain
   string (`CreateTask.jsx:105`), so the create path simplifies.

## Workflow reminders (root CLAUDE.md)

- Plan Mode first; confirm before editing; one phase at a time; one workspace at a time.
- Run `npm test` (25 tests) after each step. No integration tests for task/streak — see
  `server/backend.md` §Risk Register before touching `service.js`.
- Read the `server-patterns` project skill before editing modules.
- Pre-existing unrelated working-tree changes (frontend/docs/daily-logs) — do not commit with backend work.
