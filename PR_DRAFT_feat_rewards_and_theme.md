# PR: feat(rewards): rename badges → rewards, theme & accessibility improvements

Summary
-------
This PR implements server-side persistence and frontend management for "rewards" (previously called "badges"). It also unifies theming tokens, fixes several Tailwind/PostCSS issues, and applies accessibility improvements.

Key changes
-----------
- Add `RewardModal.jsx` and translate visible UI strings from Ukrainian to English; keep `BadgeModal.jsx` as a compatibility re-export.
- Wire reward assignment UI into `PreacherCard` and `LeaderBoard` pages (create/edit/assign/unassign flows).
- Add backend compatibility route: `/api/rewards` -> uses existing `badges` router; keep `POST /api/badges/unassign` fallback.
- Introduce semantic Tailwind tokens in `frontend/tailwind.config.cjs` and helpers in `frontend/src/index.css` (`.muted`, `.form-control`, `.btn-*`, `.card`, `.badge-pill`).
- Fix circular `@apply` that caused PostCSS errors.
- Accessibility fixes: add focus rings to small icon buttons, ensure form controls use `.form-control`, adjust dark-hover behavior for outline/ghost buttons.

Files changed (high level)
-------------------------
- frontend/src/components/RewardModal.jsx (new)
- frontend/src/pages/LeaderBoard.jsx (updated strings + usage)
- frontend/src/components/PreacherCard.jsx (assignment UI)
- frontend/src/components/SessionEditorModal.jsx, ViewSessionModal.jsx (theme-aware hover fixes)
- frontend/src/index.css (semantic helpers + dark overrides)
- backend-express/src/app.js (mount badges router at /api/rewards)

Testing
-------
1. Start services locally with docker-compose:

```bash
docker-compose up --build
```

2. Verify backend health:

```bash
curl http://localhost:8000/health
```

3. Verify rewards endpoints:

```bash
curl http://localhost:8000/api/rewards
curl http://localhost:8000/api/badges
```

4. Open frontend at http://localhost:5173 and verify:
  - LeaderBoard → Manage Rewards opens modal
  - Assign / Unassign reward flows work (Admin user)
  - Session editor and modals have readable hover/focus in dark mode

Notes & follow-ups
------------------
- Consider renaming backend routes and DB models from `badges` → `rewards` in a dedicated migration to avoid breaking older clients.
- Run a full accessibility audit (axe / Lighthouse) before merging; a few `muted` tokens are borderline contrast and may be tuned.

If you'd like, I can open the GitHub PR body from this draft or run the accessibility tightening changes now.
