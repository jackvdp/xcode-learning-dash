import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { T } from "../theme.js";

const BRIDGE_URL = "ws://127.0.0.1:8790";

// ————————————————————————————————————————————————
// A real terminal in the page. Connects to the local PTY bridge
// (npm run lab) and streams a live shell into xterm.js. Every chunk
// of output is also handed to onOutput so the lab page can watch for
// step completion.
// ————————————————————————————————————————————————
export default function LabTerminal({ onOutput }) {
  const containerRef = useRef(null);
  const onOutputRef = useRef(onOutput);
  const [status, setStatus] = useState("connecting");
  const [attempt, setAttempt] = useState(0);

  onOutputRef.current = onOutput;

  useEffect(() => {
    const term = new Terminal({
      fontFamily: T.mono,
      fontSize: 12.5,
      cursorBlink: true,
      theme: {
        background: T.bg,
        foreground: T.text,
        cursor: T.pink,
        selectionBackground: `${T.pink}55`,
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);

    const ws = new WebSocket(BRIDGE_URL);
    setStatus("connecting");

    const sendResize = () => {
      fit.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`\x00resize:${term.cols}x${term.rows}`);
      }
    };

    ws.onopen = () => {
      setStatus("up");
      sendResize();
      term.focus();
    };
    ws.onmessage = (event) => {
      term.write(event.data);
      onOutputRef.current?.(String(event.data));
    };
    ws.onclose = () => setStatus("down");
    ws.onerror = () => setStatus("down");

    const dataSub = term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(data);
    });

    const observer = new ResizeObserver(() => sendResize());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      dataSub.dispose();
      ws.onclose = null;
      ws.close();
      term.dispose();
    };
  }, [attempt]);

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: T.panel, borderBottom: `1px solid ${T.border}` }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: status === "up" ? T.green : status === "connecting" ? T.yellow : T.red,
          }}
        />
        <span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.dim }}>
          {status === "up" ? "zsh — connected to your Mac" : status === "connecting" ? "connecting to the lab bridge…" : "lab bridge not running"}
        </span>
        {status === "down" && (
          <button
            onClick={() => setAttempt((n) => n + 1)}
            style={{
              marginLeft: "auto",
              fontFamily: T.mono,
              fontSize: 11,
              color: T.teal,
              background: "none",
              border: `1px solid ${T.border}`,
              borderRadius: 5,
              padding: "3px 10px",
              cursor: "pointer",
            }}
          >
            retry
          </button>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <div ref={containerRef} style={{ height: 340, padding: "6px 0 0 10px" }} />
        {status !== "up" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `${T.bg}F0`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            {status === "down" && (
              <div style={{ maxWidth: 480, fontSize: 13.5, lineHeight: 1.7, color: T.text }}>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.red, marginBottom: 8 }}>// no shell — start the local bridge</div>
                In the repo, run{" "}
                <code style={{ fontFamily: T.mono, fontSize: "0.9em", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 4, padding: "1px 6px" }}>
                  npm run lab
                </code>{" "}
                and hit retry. The bridge runs a real shell on your Mac and only accepts connections from this page.
                <div style={{ color: T.dim, fontSize: 12.5, marginTop: 10 }}>
                  Safari blocks the live site from talking to localhost — use Chrome here, or run the dashboard locally with npm run dev.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
