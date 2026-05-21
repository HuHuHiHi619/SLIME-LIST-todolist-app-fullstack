# /wrap-day

Perform an end-of-day wrap-up for this session.

## Steps

1. **Completed work** — Summarize what was accomplished this session (tasks, phases, fixes). Be specific: file names, what changed, and why.

2. **Files modified** — List every file that was created or edited today, with a one-line description of the change.

3. **Unresolved issues / next steps** — Note anything left open, blocked, or deferred. If a task is mid-flight, state exactly where it stopped.

4. **PROGRESS.md entry** — Append a dated entry to `daily-logs/PROGRESS.md` (create the file if it does not exist) using this format:

```
## YYYY-MM-DD

### Completed
- ...

### Files Modified
- `path/to/file` — what changed

### Unresolved / Next Steps
- ...
```

Do not modify any source files. Only write to `daily-logs/PROGRESS.md`.
