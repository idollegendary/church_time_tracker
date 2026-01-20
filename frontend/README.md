# Frontend styling guide (Trecker Time)

This document explains the styling tokens, how to run the dev server, and how to toggle dark mode.

## Run dev server

In the `frontend` folder:

```bash
cd frontend
npm install    # if not already installed
npm run dev -- --host
```

Open <http://localhost:5175/> (Vite will choose an available port).

## Design tokens

Tokens are centralized in `tailwind.config.cjs` under `theme.extend`:

- `colors.primary` — the main accent color
- `colors.accent` — secondary accent
- `colors.surface` — light surface background
- `boxShadow.card` — primary card shadow
- `borderRadius.xl` — large radius for cards

Prefer Tailwind utilities in markup. Helper classes in `src/index.css` provide small composable sets:

- `.card` — base card styles (bg, radius, padding, shadow)
- `.card-hover` — subtle hover shadow
- `.btn`, `.btn-primary`, `.btn-outline` — button primitives
- `.chart-shell` — wrapper for charts
- `.table-header`, `.table-row-hover` — table helpers
- `.page-header`, `.page-sub` — headings

## Dark mode

Dark mode is enabled via the `dark` class on the document root. The app will automatically add `dark` on load if `localStorage.theme === 'dark'` or the system prefers dark.

To toggle programmatically:

```js
// set dark
localStorage.setItem('theme', 'dark')
document.documentElement.classList.add('dark')

// remove dark
localStorage.setItem('theme', 'light')
document.documentElement.classList.remove('dark')
```

## How to contribute styles

- Add tokens in `tailwind.config.cjs` and prefer `@apply` in `src/index.css` for small helpers.
- Use semantic helper classes rather than long inline lists when the same combination is reused.
- Keep components accessible: use `aria-*` attributes and `tabIndex` when necessary.

If you want, I can add a small theme toggle UI in the header to let users switch light/dark interactively.
