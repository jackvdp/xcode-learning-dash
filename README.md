# Xcode learning dashboard

A personal dashboard for working through Xcode toolchain internals — build
system, compiler, linker, SwiftPM — with progress tracking and per-target
notes. Progress persists in the browser's localStorage.

## Run it

```sh
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Layout

- `xcode-internals-dashboard.jsx` — the dashboard component (home page)
- `article.jsx` — generic article page: layout, typography blocks and SVG
  diagram primitives; renders any article object
- `articles/` — one content file per article (text + diagrams, no
  presentation), plus `index.js`, the registry the router reads. To add an
  article: create `articles/<id>.jsx`, register it in `index.js`, and it's
  served at `#/<id>` (e.g. `articles/wwdc2018-415.jsx` → `#/wwdc2018-415`)
- `theme.js` — shared Xcode-dark design tokens
- `src/App.jsx` — tiny hash router: dashboard at `#/`, articles by id
- `src/main.jsx` — entry point; also shims the `window.storage` API the
  dashboard was originally written against (claude.ai artifacts) onto
  localStorage
- `wwdc2018-415.txt` — transcript of "Behind the Scenes of the Xcode Build
  Process" (WWDC18), source for the summary and the article
