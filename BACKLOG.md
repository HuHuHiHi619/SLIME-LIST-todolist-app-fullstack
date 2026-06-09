# BACKLOG — SlimeList single source of truth

**Updated:** 2026-06-07 · **Branch:** main

The **one** live backlog for SlimeList — **open work only**. Finished work lives in
[`.claude/history/COMPLETED-2026-06.md`](.claude/history/COMPLETED-2026-06.md).
Don't re-add closed items here.

**Workflow (root `CLAUDE.md`):** Plan Mode first → confirm before editing → sequential phases →
update the relevant `MIGRATION.md` at each phase end → one workspace at a time. Run `/scrutinize`
on any fix plan before coding (standing memory).

---

## Protected / risky files — touch only inside their own phase, smoke-test manually

- `frontend/src/Config/axiosConfig.js` — interceptor now has tests; still no integration tests for the full auth cookie flow
- `frontend/src/redux/taskSlice.jsx` — no open items
- `frontend/src/components/pages/hooks/usePopup.jsx` — no open items
- `frontend/src/components/pages/create/CreateTask.jsx` — no open items
- `server/modules/task/service.js` — no integration tests (see `server/backend.md` §Risk Register)

---

## Backend — open issues

---

## Frontend — open items

---

## Housekeeping / parked

- **#22** One orphan guest task `PASS-create-*` left in **dev** Atlas from a verify run (guest cookie gone, not deletable via UI). Harmless; drop it next time you're in dev Atlas.
- **Prod data:** prod Atlas `slimelist` is completely empty — verify `MONGO_URI` in `.env.production` points to the right cluster before any real-user deploy. → **Pre-deploy checklist item.**
- **Dependabot:** GitHub reports vulnerabilities on the default branch — separate track, not triaged.
- **Lint green:** `npm run lint` passes (0 errors, 69 warnings). Warnings are legacy unused `React` imports — not blocking. New code must stay error-free.

---

## Not yet audited (frontend)

Most of `components/pages/ui/`, `animation/`, `user/` (`Home`, `AllTask`, `Upcoming`, `Category`,
`Sidebar`, `Navbar`, date pickers, `ProgressField`, `Summary`). A full audit should cover these.

---



## Related (reference, don't duplicate)
Completed work: [`.claude/history/COMPLETED-2026-06.md`](.claude/history/COMPLETED-2026-06.md) ·
Backend refactor history: [`.claude/history/BE_MIGRATION.md`](.claude/history/BE_MIGRATION.md) ·
Architecture: `frontend/frontend.md`, `server/backend.md`, root `CLAUDE.md` ·
Phase history: `frontend/MIGRATION.md`, `server/MIGRATION.md` ·
Memory: `~/.claude/.../memory/MEMORY.md`
