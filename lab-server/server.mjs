// Local PTY bridge for the dashboard's lab terminal.
//
// Runs a real login shell in a pseudo-terminal and streams it over a
// WebSocket on the loopback interface, so the web app can embed a live
// terminal. Only browser pages from the allowed origins below may
// connect; everything else is refused before a shell is spawned.
import { WebSocketServer } from "ws";
import pty from "node-pty";

const PORT = 8790;

const ALLOWED_ORIGINS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/xcode-learning-dash\.vercel\.app$/,
  /^https:\/\/xcode-learning-dash-[a-z0-9]+-jackvdps-projects\.vercel\.app$/,
];

const wss = new WebSocketServer({ host: "127.0.0.1", port: PORT });

wss.on("connection", (ws, req) => {
  const origin = req.headers.origin || "";
  if (!ALLOWED_ORIGINS.some((re) => re.test(origin))) {
    ws.close(4403, "origin not allowed");
    console.log(`refused connection from origin: ${origin || "(none)"}`);
    return;
  }

  let shell;
  try {
    shell = pty.spawn(process.env.SHELL || "/bin/zsh", ["-l"], {
      name: "xterm-256color",
      cols: 100,
      rows: 24,
      cwd: process.env.HOME,
      env: process.env,
    });
  } catch (error) {
    console.log(`failed to spawn shell: ${error.message}`);
    ws.close(4500, "could not spawn shell");
    return;
  }
  console.log(`shell ${shell.pid} started for ${origin}`);

  shell.onData((data) => {
    if (ws.readyState === ws.OPEN) ws.send(data);
  });
  shell.onExit(() => ws.close());

  ws.on("message", (message) => {
    const text = message.toString();
    // Control messages are prefixed with a NUL byte, which never appears
    // in typed input.
    if (text.startsWith("\x00resize:")) {
      const [cols, rows] = text.slice(8).split("x").map(Number);
      if (cols > 0 && rows > 0 && cols < 1000 && rows < 1000) shell.resize(cols, rows);
      return;
    }
    shell.write(text);
  });

  ws.on("close", () => {
    console.log(`shell ${shell.pid} closed`);
    shell.kill();
  });
});

console.log(`lab terminal bridge listening on ws://127.0.0.1:${PORT}`);
console.log("leave this running, then open a lab page in the dashboard");
