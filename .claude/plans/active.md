# Active Plan — Housekeeping

Branch: `chore/housekeeping`

---

## Items

- [x] **Prod data check** — Verify `MONGO_URI` in `.env.production` points to the correct Atlas cluster before any real-user deploy.
- [x] **Dependabot** — Triage and fix GitHub vulnerability alerts.
  - Frontend: 0 vulnerabilities (axios→1.17.0, react-router-dom→6.30.4, postcss+follow-redirects via audit fix)
  - Server: 2 moderate remain — uuid inside node-cron transitive; fix requires `--force`→uuid@14 (breaking). Skipped.
- [x] **`startDate` / `deadline`** — Dropped `startDate` (redundant with `createdAt`, unused in queries/UI). `deadline` kept — powers Upcoming view and overdue cron.
- [x] **Lint warnings** — Cleared all 67 warnings: removed legacy `React` imports across 44 files, dropped 5 stale eslint-disable directives, fixed 15 specific unused-var/dead-code warnings, suppressed one intentional dep-array deviation with targeted disable.
- [ ] **Frontend audit** — `components/pages/ui/`, `animation/`, `user/` (`Home`, `AllTask`, `Upcoming`, `Category`, `Sidebar`, `Navbar`, date pickers, `ProgressField`, `Summary`) — full pass before Phase 3.
- [ ] **#22 Orphan task** — Drop guest task `PASS-create-*` in dev Atlas console (guest cookie gone, not deletable via UI).

---

_Move to `.claude/history/` and clear this file when done._
