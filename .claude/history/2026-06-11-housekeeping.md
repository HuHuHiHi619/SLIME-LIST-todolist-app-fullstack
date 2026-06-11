# Active Plan — Housekeeping

Completed: 2026-06-11

Branch: `chore/housekeeping`

---

## Items

- [x] **Prod data check** — Verify `MONGO_URI` in `.env.production` points to the correct Atlas cluster before any real-user deploy.
- [x] **Dependabot** — Triage and fix GitHub vulnerability alerts.
  - Frontend: 0 vulnerabilities (axios→1.17.0, react-router-dom→6.30.4, postcss+follow-redirects via audit fix)
  - Server: 2 moderate remain — uuid inside node-cron transitive; fix requires `--force`→uuid@14 (breaking). Skipped.
- [x] **`startDate` / `deadline`** — Dropped `startDate` (redundant with `createdAt`, unused in queries/UI). `deadline` kept — powers Upcoming view and overdue cron.
- [x] **Lint warnings** — Cleared all 67 warnings: removed legacy `React` imports across 44 files, dropped 5 stale eslint-disable directives, fixed 15 specific unused-var/dead-code warnings, suppressed one intentional dep-array deviation with targeted disable.
- [x] **Frontend audit** — Full pass across views, layout, animation, forms, dashboard, task components. Fixed: NotificationForm click-outside bug (inverted condition), LoadingPage empty Suspense fallback (added BouncingSlimeLoading). Noted: BadgeField null stub (Phase 3), CategoryTagField hidden select (safe to drop later).
- [x] **#22 Orphan task** — Deleted guest task `PASS-create-*` directly from Atlas dev console.
