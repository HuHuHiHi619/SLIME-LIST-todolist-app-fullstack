# Active Plan — Housekeeping

Branch: `chore/housekeeping`

---

## Items

- [x] **Prod data check** — Verify `MONGO_URI` in `.env.production` points to the correct Atlas cluster before any real-user deploy.
- [x] **Dependabot** — Triage and fix GitHub vulnerability alerts.
  - Frontend: 0 vulnerabilities (axios→1.17.0, react-router-dom→6.30.4, postcss+follow-redirects via audit fix)
  - Server: 2 moderate remain — uuid inside node-cron transitive; fix requires `--force`→uuid@14 (breaking). Skipped.
- [ ] **`startDate` / `deadline`** — Decide if these Task fields are still necessary; resolve before Phase 2 planning.
- [ ] **Lint warnings** — 69 warnings from legacy unused `React` imports. Clean them up; all new code must stay error-free.
- [ ] **Frontend audit** — `components/pages/ui/`, `animation/`, `user/` (`Home`, `AllTask`, `Upcoming`, `Category`, `Sidebar`, `Navbar`, date pickers, `ProgressField`, `Summary`) — full pass before Phase 3.
- [ ] **#22 Orphan task** — Drop guest task `PASS-create-*` in dev Atlas console (guest cookie gone, not deletable via UI).

---

_Move to `.claude/history/` and clear this file when done._
