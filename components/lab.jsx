import { useCallback, useEffect, useRef, useState } from "react";
import { T } from "../theme.js";
import { renderBlock } from "./article.jsx";
import LabTerminal from "./lab-terminal.jsx";

// ————————————————————————————————————————————————
// Generic lab page. A lab is an article with a live terminal and
// checkpoints: each step declares a regex, and the page watches the
// terminal's output stream — when the regex matches, the step ticks
// itself off. Progress persists like dashboard progress does.
//
// Lab shape:
//   { id, breadcrumb, eyebrow, title, lede,
//     intro: [blocks], steps: [{ id, title, body, watch: { pattern, label } }],
//     outro: [blocks] }
// watch.pattern is a RegExp without the g flag.
// ————————————————————————————————————————————————

// Copyable command / file block for lab step bodies.
export function Cmd({ title, children }) {
  const [copied, setCopied] = useState(false);
  const text = typeof children === "string" ? children : String(children);
  return (
    <div style={{ margin: "10px 0", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "5px 12px", borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.dim }}>{title || "terminal"}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          style={{
            marginLeft: "auto",
            fontFamily: T.mono,
            fontSize: 10.5,
            color: copied ? T.green : T.teal,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "10px 12px", overflowX: "auto", fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.6, color: T.text }}>
        {text}
      </pre>
    </div>
  );
}

const stripAnsi = (s) =>
  s
    .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, "")
    .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "")
    .replace(/\x1b[@-_]/g, "")
    .replace(/\r/g, "");

export default function Lab({ lab }) {
  const storageKey = `lab:${lab.id}`;
  const [done, setDone] = useState(() => new Set());
  const [loaded, setLoaded] = useState(false);
  const bufferRef = useRef("");
  const doneRef = useRef(done);
  doneRef.current = done;

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(storageKey);
        if (result?.value) setDone(new Set(JSON.parse(result.value)));
      } catch {
        // first visit
      }
      setLoaded(true);
    })();
  }, [storageKey]);

  const persist = (next) => {
    window.storage.set(storageKey, JSON.stringify([...next])).catch(() => {});
  };

  const markDone = useCallback(
    (stepIds) => {
      setDone((prev) => {
        const next = new Set(prev);
        stepIds.forEach((id) => next.add(id));
        persist(next);
        return next;
      });
    },
    [storageKey]
  );

  const handleOutput = useCallback(
    (chunk) => {
      bufferRef.current = (bufferRef.current + stripAnsi(chunk)).slice(-65536);
      const matched = lab.steps
        .filter((step) => !doneRef.current.has(step.id) && step.watch.pattern.test(bufferRef.current))
        .map((step) => step.id);
      if (matched.length) markDone(matched);
    },
    [lab, markDone]
  );

  const toggleStep = (id) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next);
      return next;
    });
  };

  const reset = () => {
    setDone(new Set());
    window.storage.delete(storageKey).catch(() => {});
  };

  const activeIndex = lab.steps.findIndex((s) => !done.has(s.id));
  const complete = loaded && activeIndex === -1;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans, paddingBottom: 80 }}>
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: ${T.pink}44; }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 10, background: `${T.panel}F2`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "10px 16px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[T.red, T.yellow, T.green].map((c, i) => (
              <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }} />
            ))}
          </div>
          <a href="#/" style={{ fontFamily: T.mono, fontSize: 12.5, color: T.dim, textDecoration: "none" }}>← ToolchainInternals</a>
          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 12, color: T.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lab.breadcrumb}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "36px 16px 0" }}>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, marginBottom: 8 }}>// {lab.eyebrow}</div>
        <h1 style={{ fontFamily: T.mono, fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 600, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.25 }}>
          {lab.title}
        </h1>
        <p style={{ color: T.dim, fontSize: 14, margin: "14px 0 0", lineHeight: 1.6 }}>{lab.lede}</p>

        {lab.intro.map(renderBlock)}

        <div style={{ position: "sticky", top: 54, zIndex: 5, margin: "28px 0", boxShadow: `0 8px 24px ${T.bg}` }}>
          <LabTerminal onOutput={handleOutput} />
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "36px 0 14px" }}>
          <h2 style={{ fontFamily: T.mono, fontSize: 19, fontWeight: 600, margin: 0 }}>Checkpoints</h2>
          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.dim }}>
            {done.size}/{lab.steps.length} — the page watches the terminal and ticks these off itself
          </span>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {lab.steps.map((step, i) => {
            const isDone = done.has(step.id);
            const isActive = i === activeIndex;
            return (
              <div
                key={step.id}
                style={{
                  background: T.panel,
                  border: `1px solid ${T.border}`,
                  borderLeft: `3px solid ${isDone ? T.green : isActive ? T.pink : T.border}`,
                  borderRadius: 10,
                  padding: "14px 18px",
                  opacity: isDone ? 0.75 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: isDone ? T.green : T.dim }}>
                    {isDone ? "✓" : `${String(i + 1).padStart(2, "0")}`}
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 14.5, fontWeight: 600, color: isDone ? T.dim : T.text }}>{step.title}</span>
                  <button
                    onClick={() => toggleStep(step.id)}
                    style={{
                      marginLeft: "auto",
                      fontFamily: T.mono,
                      fontSize: 10.5,
                      color: T.dim,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {isDone ? "undo" : "mark done"}
                  </button>
                </div>
                {!isDone && (
                  <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7 }}>
                    {step.body}
                    <div style={{ fontFamily: T.mono, fontSize: 11, color: T.yellow, marginTop: 10 }}>
                      // watching for: {step.watch.label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {complete && (
          <div style={{ margin: "28px 0 0", fontFamily: T.mono, fontSize: 13.5, color: T.green, border: `1px solid ${T.green}55`, background: `${T.green}11`, borderRadius: 10, padding: "14px 18px" }}>
            ** LAB PASSED ** — all {lab.steps.length} checkpoints hit
          </div>
        )}

        {lab.outro.map(renderBlock)}

        <div style={{ marginTop: 48, paddingTop: 16, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center" }}>
          <a href="#/" style={{ fontFamily: T.mono, fontSize: 13, color: T.pink, textDecoration: "none" }}>← back to the dashboard</a>
          <button
            onClick={reset}
            style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 11.5, color: T.dim, background: "none", border: `1px solid ${T.border}`, borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}
          >
            reset lab
          </button>
        </div>
      </main>
    </div>
  );
}
