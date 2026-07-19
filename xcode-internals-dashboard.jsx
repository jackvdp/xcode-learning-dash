import { useState, useEffect, useRef } from "react";
import { T } from "./theme.js";

const STORAGE_KEY = "xcode-internals-dashboard-v1";

// ————————————————————————————————————————————————
// The compilation pipeline — the signature element
// ————————————————————————————————————————————————
const PIPELINE = [
  {
    id: "source",
    label: ".swift",
    color: T.text,
    title: "Source files",
    body: "Plain Swift text. The build system decides which files need recompiling by hashing inputs and walking the dependency graph — this is why incremental builds live or die on module boundaries.",
    cmd: null,
  },
  {
    id: "ast",
    label: "Parse → AST",
    color: T.pink,
    title: "Parser & AST",
    body: "The parser turns tokens into an Abstract Syntax Tree. No type information yet — just structure. SwiftSyntax exposes this same tree to tooling like macros and SwiftLint rules.",
    cmd: "swiftc -dump-ast File.swift",
  },
  {
    id: "sema",
    label: "Sema",
    color: T.pink,
    title: "Semantic analysis",
    body: "Type checking and inference annotate the AST. This is where 'expression too complex' errors come from — the constraint solver giving up. Most compile-time cost in SwiftUI-heavy code lands here.",
    cmd: "swiftc -Xfrontend -debug-time-function-bodies",
  },
  {
    id: "silgen",
    label: "SILGen",
    color: T.red,
    title: "Raw SIL",
    body: "The typed AST lowers to Swift Intermediate Language — an SSA-form IR that still knows about Swift semantics: ARC, protocols, generics. Raw SIL hasn't had dataflow rules enforced yet.",
    cmd: "swiftc -emit-silgen File.swift",
  },
  {
    id: "silopt",
    label: "SIL Optimizer",
    color: T.red,
    title: "Canonical SIL",
    body: "Mandatory passes run diagnostics (definite initialisation, exhaustive switches), then optimisation passes do the Swift-specific work LLVM can't: ARC elision, devirtualisation, generic specialisation. This is where -O earns its keep.",
    cmd: "swiftc -emit-sil -O File.swift",
  },
  {
    id: "irgen",
    label: "IRGen → LLVM IR",
    color: T.yellow,
    title: "LLVM IR",
    body: "Canonical SIL lowers to LLVM's target-independent IR. High-level Swift semantics are gone now — from here it's the same machinery clang uses for C and Objective-C.",
    cmd: "swiftc -emit-ir File.swift",
  },
  {
    id: "backend",
    label: "LLVM → .o",
    color: T.yellow,
    title: "Code generation",
    body: "LLVM optimisation passes run, then the backend emits machine code per architecture as Mach-O object files. One .o per file (incremental) or per module (WMO).",
    cmd: "swiftc -emit-assembly File.swift",
  },
  {
    id: "link",
    label: "ld / linker",
    color: T.teal,
    title: "Static linking",
    body: "ld stitches object files and static libraries into one executable, resolving symbols at build time. Static archives (.a) are copied in; dynamic libraries just leave a LC_LOAD_DYLIB load command behind.",
    cmd: "OTHER_LDFLAGS, -Xlinker",
  },
  {
    id: "macho",
    label: "Mach-O",
    color: T.teal,
    title: "The binary",
    body: "Segments (__TEXT, __DATA, __LINKEDIT), load commands, symbol tables. dSYMs are the debug info stripped out of here — the thing your Bitrise symbolication pipeline reunites with crash reports.",
    cmd: "otool -L MyApp / nm / symbols",
  },
  {
    id: "dyld",
    label: "dyld @ launch",
    color: T.green,
    title: "Dynamic linking at runtime",
    body: "Before main() runs, dyld maps every dynamic framework, binds symbols and runs initialisers. Every dylib you add is launch-time work — the core of the static vs dynamic trade-off.",
    cmd: "DYLD_PRINT_STATISTICS=1",
  },
];

// ————————————————————————————————————————————————
// Curriculum — modules as build targets
// ————————————————————————————————————————————————
const MODULES = [
  {
    id: "buildsystem",
    name: "BuildSystem",
    tag: "target",
    desc: "What actually happens when you hit ⌘B — the dependency graph, task planning and parallelisation.",
    resources: [
      { id: "bs0", kind: "primer", title: "The Toolchain, From Scratch — read this first", url: "#/toolchain-primer" },
      {
        id: "bs1",
        kind: "wwdc",
        title: "Behind the Scenes of the Xcode Build Process — WWDC18",
        url: "https://developer.apple.com/videos/play/wwdc2018/415/",
        article: "#/wwdc2018-415",
        summary:
          "One speaker per stage: build system, Clang, Swift, then the linker. Most of it hangs off one idea — ⌘B turns your project into a directed graph of tasks, each with a signature hashed from its inputs, command line and tool version, and a task reruns only when that signature changes. That's all an incremental build is. Along the way you learn that headermaps are how Xcode tells Clang where your headers actually live, that Clang modules ignore your #defines so the cache can be shared, that Swift parses every other file in the target to find declarations (which is why Xcode 10 batches files into groups), and that the linker moves and patches code but can never create it. Homework: declare inputs and outputs on run script phases, keep 'parallelize build' ticked, framework-qualify your header imports, and don't trust auto-link for your own targets.",
      },
      { id: "bs2", kind: "wwdc", title: "Demystify parallelization in Xcode builds — WWDC22", url: "https://developer.apple.com/videos/play/wwdc2022/110364/" },
      { id: "bs3", kind: "article", title: "Understanding the Xcode build system, Part 1 — flyingharley", url: "https://flyingharley.dev/posts/understanding-the-xcode-build-system-part-1" },
      { id: "bs4", kind: "article", title: "Understanding the Xcode build system, Part 2 — flyingharley", url: "https://flyingharley.dev/posts/understanding-the-xcode-build-system-part-2" },
      { id: "bs5", kind: "article", title: "The Xcode Build System — pewpewthespells", url: "https://pewpewthespells.com/blog/xcode_build_system.html" },
    ],
  },
  {
    id: "settings",
    name: "BuildSettings",
    tag: "target",
    desc: "Setting levels, resolution order, xcconfig syntax, schemes and configurations.",
    resources: [
      { id: "st1", kind: "wwdc", title: "Explore advanced project configuration in Xcode — WWDC21", url: "https://developer.apple.com/videos/play/wwdc2021/10210/" },
      { id: "st2", kind: "article", title: "xcconfig — NSHipster", url: "https://nshipster.com/xcconfig/" },
      { id: "st3", kind: "ref", title: "xcodebuildsettings.com — searchable settings reference", url: "https://xcodebuildsettings.com" },
    ],
  },
  {
    id: "compiler",
    name: "SwiftCompiler",
    tag: "target",
    desc: "The frontend pipeline: parse, sema, SILGen, SIL optimisation, IRGen, LLVM.",
    resources: [
      { id: "cp1", kind: "docs", title: "Swift Compiler overview — swift.org", url: "https://www.swift.org/documentation/swift-compiler/" },
      { id: "cp2", kind: "article", title: "How a Swift file is compiled — Thuyen's corner", url: "https://trinhngocthuyen.com/posts/tech/how-a-swift-file-is-compiled/" },
      { id: "cp3", kind: "docs", title: "SIL documentation — swiftlang/swift", url: "https://github.com/swiftlang/swift/blob/main/docs/SIL/SIL.md" },
      { id: "cp4", kind: "article", title: "How Does the Swift Compiler Work — SwiftRocks", url: "https://swiftrocks.com/how-does-the-swift-compiler-work" },
    ],
  },
  {
    id: "linking",
    name: "Linking",
    tag: "target",
    desc: "Static vs dynamic, Mach-O anatomy, dyld, and what it all costs at launch.",
    resources: [
      { id: "ln1", kind: "wwdc", title: "Link fast: Improve build and launch times — WWDC22", url: "https://developer.apple.com/videos/play/wwdc2022/110362/" },
      { id: "ln2", kind: "article", title: "Intro to static & dynamic libraries and frameworks — Bogdan Poplauschi", url: "https://bpoplauschi.github.io/2021/10/24/Intro-to-static-and-dynamic-libraries-frameworks.html" },
      { id: "ln3", kind: "article", title: "Advanced static vs dynamic libraries — Bogdan Poplauschi", url: "https://bpoplauschi.github.io/2021/10/25/Advanced-static-vs-dynamic-libraries-and-frameworks.html" },
      { id: "ln4", kind: "article", title: "What is dyld? — Emerge Tools", url: "https://www.emergetools.com/glossary/dyld" },
      { id: "ln5", kind: "article", title: "Static vs Dynamic Frameworks on iOS — Emerge Tools", url: "https://www.emergetools.com/blog/posts/static-vs-dynamic-frameworks-ios-discussion-chat-gpt" },
      { id: "ln6", kind: "thread", title: "iOS Static vs Dynamic Linking — MobileNativeFoundation #133", url: "https://github.com/MobileNativeFoundation/discussions/discussions/133" },
    ],
  },
  {
    id: "spm",
    name: "SwiftPM",
    tag: "target",
    desc: "Manifest compilation, dependency resolution, and the new open-source Swift Build engine.",
    resources: [
      { id: "sp1", kind: "article", title: "All about SPM and the Swift toolchain — The.Swift.Dev", url: "https://theswiftdev.com/all-about-the-swift-package-manager-and-the-swift-toolchain/" },
      { id: "sp2", kind: "article", title: "Swift Package Manager tutorial — The.Swift.Dev", url: "https://theswiftdev.com/swift-package-manager-tutorial/" },
      { id: "sp3", kind: "docs", title: "swift-build (Xcode's build engine, open source)", url: "https://github.com/swiftlang/swift-build" },
      { id: "sp4", kind: "docs", title: "swift-package-manager repo docs", url: "https://github.com/swiftlang/swift-package-manager/tree/main/Documentation" },
    ],
  },
];

const KIND_COLOR = { wwdc: T.pink, article: T.teal, docs: T.yellow, ref: T.yellow, thread: T.red, primer: T.green };

const TOTAL = MODULES.reduce((n, m) => n + m.resources.length, 0);

// ————————————————————————————————————————————————
// Component
// ————————————————————————————————————————————————
export default function XcodeInternalsDashboard() {
  const [done, setDone] = useState({});
  const [notes, setNotes] = useState({});
  const [open, setOpen] = useState({ buildsystem: true });
  const [stage, setStage] = useState("silgen");
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const saveTimer = useRef(null);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          const data = JSON.parse(result.value);
          setDone(data.done || {});
          setNotes(data.notes || {});
        }
      } catch (e) {
        // No saved state yet — fresh start is fine
      }
      setLoaded(true);
    })();
  }, []);

  const persist = (nextDone, nextNotes) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify({ done: nextDone, notes: nextNotes }));
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch (e) {
        setSaveState("error");
      }
    }, 500);
  };

  const toggle = (rid) => {
    const next = { ...done, [rid]: !done[rid] };
    if (!next[rid]) delete next[rid];
    setDone(next);
    persist(next, notes);
  };

  const setNote = (mid, text) => {
    const next = { ...notes, [mid]: text };
    setNotes(next);
    persist(done, next);
  };

  const resetAll = async () => {
    try {
      await window.storage.delete(STORAGE_KEY);
    } catch (e) {}
    setDone({});
    setNotes({});
  };

  const doneCount = Object.keys(done).length;
  const pct = Math.round((doneCount / TOTAL) * 100);
  const complete = doneCount === TOTAL;
  const active = PIPELINE.find((p) => p.id === stage);

  const status = complete
    ? { text: "Build Succeeded", color: T.green }
    : doneCount > 0
    ? { text: `Building… ${doneCount}/${TOTAL} tasks`, color: T.yellow }
    : { text: "Ready to build", color: T.dim };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.dim, fontFamily: T.mono, fontSize: 13 }}>
        Loading derived data…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans, paddingBottom: 64 }}>
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: ${T.pink}44; }
        a { color: inherit; }
        textarea:focus, button:focus-visible, input:focus-visible { outline: 2px solid ${T.pink}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
        .stage-chip:hover { border-color: ${T.dim} !important; }
        .res-row:hover { background: ${T.panelRaised}; }
      `}</style>

      {/* ——— Toolbar ——— */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: `${T.panel}F2`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "10px 16px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[T.red, T.yellow, T.green].map((c, i) => (
              <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }} />
            ))}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 13, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 12px", display: "flex", alignItems: "center", gap: 8, flex: "1 1 240px", minWidth: 0 }}>
            <span style={{ color: T.dim, whiteSpace: "nowrap" }}>ToolchainInternals ▸</span>
            <span style={{ color: status.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{status.text}</span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: saveState === "error" ? T.red : T.dim, minWidth: 52, textAlign: "right" }}>
            {saveState === "saving" ? "saving…" : saveState === "saved" ? "saved ✓" : saveState === "error" ? "save failed" : ""}
          </div>
        </div>
        {/* progress rail */}
        <div style={{ maxWidth: 880, margin: "8px auto 0" }}>
          <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: complete ? T.green : T.pink, transition: "width 400ms ease" }} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "28px 16px 0" }}>
        {/* ——— Title ——— */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, marginBottom: 6 }}>// Jack's field guide to the toolchain</div>
          <h1 style={{ fontFamily: T.mono, fontSize: "clamp(22px, 4.5vw, 32px)", fontWeight: 600, margin: 0, letterSpacing: "-0.5px" }}>
            <span style={{ color: T.pink }}>import</span> XcodeInternals
          </h1>
          <p style={{ color: T.dim, fontSize: 14, margin: "10px 0 0", maxWidth: 560, lineHeight: 1.5 }}>
            Build system → compiler → linker → SPM. Tick resources as you finish them, click through the pipeline below, and capture what you learn in each target's notes. Everything saves automatically.
          </p>
        </div>

        {/* ——— Signature: the pipeline ——— */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: T.dim, marginBottom: 12 }}>
            The pipeline — ⌘B to launch
          </div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 10, WebkitOverflowScrolling: "touch" }}>
            {PIPELINE.map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <button
                  className="stage-chip"
                  onClick={() => setStage(p.id)}
                  style={{
                    fontFamily: T.mono, fontSize: 12, padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                    background: stage === p.id ? `${p.color}1A` : T.panel,
                    border: `1px solid ${stage === p.id ? p.color : T.border}`,
                    color: stage === p.id ? p.color : T.text,
                    transition: "all 150ms ease", whiteSpace: "nowrap",
                  }}
                >
                  {p.label}
                </button>
                {i < PIPELINE.length - 1 && <span style={{ color: T.border, fontFamily: T.mono, fontSize: 12 }}>→</span>}
              </div>
            ))}
          </div>
          {active && (
            <div style={{ marginTop: 10, background: T.panel, border: `1px solid ${T.border}`, borderLeft: `3px solid ${active.color}`, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 600, color: active.color, marginBottom: 6 }}>{active.title}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.text }}>{active.body}</p>
              {active.cmd && (
                <div style={{ marginTop: 12, fontFamily: T.mono, fontSize: 12.5, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 12px", color: T.yellow, overflowX: "auto", whiteSpace: "nowrap" }}>
                  <span style={{ color: T.dim }}>$ </span>{active.cmd}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ——— Targets ——— */}
        <div style={{ fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: T.dim, marginBottom: 12 }}>
          Targets ({doneCount}/{TOTAL} resources compiled)
        </div>

        {MODULES.map((m) => {
          const mDone = m.resources.filter((r) => done[r.id]).length;
          const mComplete = mDone === m.resources.length;
          const isOpen = !!open[m.id];
          return (
            <section key={m.id} style={{ background: T.panel, border: `1px solid ${mComplete ? `${T.green}55` : T.border}`, borderRadius: 10, marginBottom: 14, overflow: "hidden" }}>
              <button
                onClick={() => setOpen({ ...open, [m.id]: !isOpen })}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", color: T.text, textAlign: "left" }}
                aria-expanded={isOpen}
              >
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 150ms ease", display: "inline-block" }}>▸</span>
                <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 600 }}>
                  <span style={{ color: T.pink }}>target</span> {m.name}
                </span>
                <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 12, color: mComplete ? T.green : T.dim, whiteSpace: "nowrap" }}>
                  {mComplete ? "✓ built" : `${mDone}/${m.resources.length}`}
                </span>
              </button>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${T.border}` }}>
                  <p style={{ margin: 0, padding: "12px 16px 4px", fontSize: 13, color: T.dim, lineHeight: 1.5 }}>{m.desc}</p>

                  {m.resources.map((r) => (
                    <div key={r.id} className="res-row" style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", transition: "background 120ms ease" }}>
                      <button
                        onClick={() => toggle(r.id)}
                        aria-label={done[r.id] ? `Mark ${r.title} unread` : `Mark ${r.title} read`}
                        style={{
                          width: 18, height: 18, marginTop: 1, borderRadius: 5, flexShrink: 0, cursor: "pointer",
                          border: `1.5px solid ${done[r.id] ? T.green : T.dim}`,
                          background: done[r.id] ? `${T.green}22` : "transparent",
                          color: T.green, fontSize: 11, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 120ms ease",
                        }}
                      >
                        {done[r.id] ? "✓" : ""}
                      </button>
                      <div style={{ minWidth: 0 }}>
                        <a href={r.url} target={r.url.startsWith("#") ? undefined : "_blank"} rel={r.url.startsWith("#") ? undefined : "noopener noreferrer"} style={{ fontSize: 14, lineHeight: 1.45, textDecoration: "none", color: done[r.id] ? T.dim : T.text, display: "block" }}>
                          {r.title}
                        </a>
                        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: KIND_COLOR[r.kind] || T.dim, textTransform: "uppercase", letterSpacing: "1px" }}>{r.kind}</span>
                        {r.summary && (
                          <p style={{ margin: "6px 0 0", fontSize: 13, color: T.dim, lineHeight: 1.55, maxWidth: 640 }}>{r.summary}</p>
                        )}
                        {r.article && (
                          <a href={r.article} style={{ display: "inline-block", marginTop: 6, fontFamily: T.mono, fontSize: 12, color: T.pink, textDecoration: "none" }}>
                            read the full write-up →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  <div style={{ padding: "8px 16px 16px" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, margin: "8px 0 6px" }}>// {m.name}.notes — what I actually learned</div>
                    <textarea
                      value={notes[m.id] || ""}
                      onChange={(e) => setNote(m.id, e.target.value)}
                      placeholder={"Mental models, gotchas, things to try on the Zopa codebase…"}
                      rows={notes[m.id] ? Math.min(10, (notes[m.id].match(/\n/g) || []).length + 2) : 2}
                      style={{
                        width: "100%", resize: "vertical", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8,
                        color: T.text, fontFamily: T.mono, fontSize: 13, lineHeight: 1.6, padding: "10px 12px",
                      }}
                    />
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {/* ——— Footer ——— */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: complete ? T.green : T.dim }}>
            {complete ? `** BUILD SUCCEEDED ** — all ${TOTAL} resources compiled` : `${pct}% — notes and progress persist between sessions`}
          </div>
          <button
            onClick={() => { if (window.confirm("Clear all progress and notes? This can't be undone.")) resetAll(); }}
            style={{ fontFamily: T.mono, fontSize: 12, color: T.red, background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
          >
            xcodebuild clean
          </button>
        </div>
      </main>
    </div>
  );
}
