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

## Labs

Lab pages embed a live terminal so you can run the real Swift toolchain
from the browser. They need the local PTY bridge:

```sh
npm run lab
```

Leave it running and open a lab page. The bridge listens on
127.0.0.1:8790 only, and only accepts WebSocket connections from this
app's origins (localhost dev and the Vercel deployment). Note Safari
blocks https pages from talking to localhost, so use the labs from a
local `npm run dev` session or from Chrome.

## Layout

- `components/xcode-internals-dashboard.jsx` — the dashboard component
  (home page)
- `components/article.jsx` — generic article page: layout, typography
  blocks and SVG diagram primitives; renders any article object
- `articles/` — one content file per article (text + diagrams, no
  presentation), plus `index.js`, the registry the router reads. To add an
  article: create `articles/<id>.jsx`, register it in `index.js`, and it's
  served at `#/<id>` (e.g. `articles/wwdc2018-415.jsx` → `#/wwdc2018-415`)
- `components/lab.jsx` + `components/lab-terminal.jsx` — lab page:
  xterm.js terminal wired to the local bridge, plus checkpoints that
  watch terminal output and tick themselves off
- `labs/` — one content file per lab, plus `index.js`, the registry.
  Labs are served at `#/labs/<id>`
- `lab-server/` — the PTY bridge (`npm run lab`); own package.json so
  its native dependency stays out of the site build
- `theme.js` — shared Xcode-dark design tokens
- `src/App.jsx` — tiny hash router: dashboard at `#/`, articles by id
- `src/main.jsx` — entry point; also shims the `window.storage` API the
  dashboard was originally written against (claude.ai artifacts) onto
  localStorage
- `wwdc2018-415.txt` — transcript of "Behind the Scenes of the Xcode Build
  Process" (WWDC18), source for the summary and the article
