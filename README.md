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
- `wwdc2018-415-article.jsx` — full article write-up of WWDC18 session 415,
  served at `#/wwdc2018-415` and linked from the video's row on the dashboard
- `theme.js` — shared Xcode-dark design tokens
- `src/App.jsx` — tiny hash router between the two pages
- `src/main.jsx` — entry point; also shims the `window.storage` API the
  dashboard was originally written against (claude.ai artifacts) onto
  localStorage
- `wwdc2018-415.txt` — transcript of "Behind the Scenes of the Xcode Build
  Process" (WWDC18), source for the summary and the article
