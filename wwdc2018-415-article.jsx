import { T } from "./theme.js";

// ————————————————————————————————————————————————
// Article building blocks
// ————————————————————————————————————————————————
function Kicker({ children }) {
  return <div style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, margin: "52px 0 8px" }}>// {children}</div>;
}

function H2({ children }) {
  return <h2 style={{ fontFamily: T.mono, fontSize: 21, fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.3px" }}>{children}</h2>;
}

function H3({ children }) {
  return <h3 style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 600, color: T.teal, margin: "28px 0 10px" }}>{children}</h3>;
}

function P({ children }) {
  return <p style={{ fontSize: 15, lineHeight: 1.75, margin: "0 0 16px", color: T.text }}>{children}</p>;
}

function C({ children }) {
  return (
    <code style={{ fontFamily: T.mono, fontSize: "0.86em", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 4, padding: "1px 5px" }}>
      {children}
    </code>
  );
}

function A({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: T.teal, textDecoration: "none", borderBottom: `1px solid ${T.teal}55` }}>
      {children}
    </a>
  );
}

function CodeBlock({ title, children }) {
  return (
    <div style={{ margin: "0 0 16px", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
      {title && (
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, padding: "6px 14px", borderBottom: `1px solid ${T.border}` }}>{title}</div>
      )}
      <pre style={{ margin: 0, padding: "12px 14px", overflowX: "auto", fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.6, color: T.text }}>
        {children}
      </pre>
    </div>
  );
}

function Callout({ color = T.yellow, label, children }) {
  return (
    <div style={{ margin: "0 0 16px", background: T.panel, border: `1px solid ${T.border}`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "12px 16px" }}>
      {label && (
        <div style={{ fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", color, marginBottom: 6 }}>{label}</div>
      )}
      <div style={{ fontSize: 14, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function UL({ items }) {
  return (
    <ul style={{ margin: "0 0 16px", paddingLeft: 22, display: "grid", gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 14.5, lineHeight: 1.65, color: T.text }}>{item}</li>
      ))}
    </ul>
  );
}

function Figure({ caption, minWidth, children }) {
  return (
    <figure style={{ margin: "24px 0", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 16px 10px" }}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth }}>{children}</div>
      </div>
      <figcaption style={{ fontFamily: T.mono, fontSize: 11.5, color: T.dim, marginTop: 10, lineHeight: 1.5 }}>{caption}</figcaption>
    </figure>
  );
}

// ————————————————————————————————————————————————
// SVG diagram primitives
// ————————————————————————————————————————————————
function Node({ x, y, w, h = 34, label, sub, color = T.text }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={T.panelRaised} stroke={T.border} />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -2 : 4)} textAnchor="middle" fontFamily={T.mono} fontSize="11.5" fill={color}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ from, to, marker, dashed }) {
  return (
    <line
      x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
      stroke={T.dim} strokeWidth="1.2"
      strokeDasharray={dashed ? "4 4" : undefined}
      markerEnd={`url(#${marker})`}
    />
  );
}

function ArrowMarker({ id }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill={T.dim} />
      </marker>
    </defs>
  );
}

// ————————————————————————————————————————————————
// Diagrams
// ————————————————————————————————————————————————
function BuildGraphFigure() {
  return (
    <Figure
      minWidth={560}
      caption="The directed graph behind ⌘B. Compile tasks sit in independent lanes and run in parallel; the link task consumes every lane's output, so it has to come last. llbuild walks this graph and skips any task whose signature hasn't changed."
    >
      <svg viewBox="0 0 640 240" style={{ width: "100%", display: "block" }} role="img" aria-label="Build task dependency graph">
        <ArrowMarker id="arrA" />
        <Node x={16} y={24} w={152} label="PetController.m" />
        <Node x={16} y={96} w={152} label="PetView.m" />
        <Node x={16} y={168} w={152} label="AppDelegate.m" />
        {[41, 113, 185].map((y) => (
          <g key={y}>
            <Arrow from={[172, y]} to={[252, y]} marker="arrA" />
            <text x={212} y={y - 6} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>clang</text>
          </g>
        ))}
        <Node x={256} y={24} w={152} label="PetController.o" color={T.yellow} />
        <Node x={256} y={96} w={152} label="PetView.o" color={T.yellow} />
        <Node x={256} y={168} w={152} label="AppDelegate.o" color={T.yellow} />
        <Arrow from={[412, 41]} to={[464, 106]} marker="arrA" />
        <Arrow from={[412, 113]} to={[464, 113]} marker="arrA" />
        <Arrow from={[412, 185]} to={[464, 120]} marker="arrA" />
        <Node x={468} y={96} w={56} label="ld" color={T.teal} />
        <Arrow from={[528, 113]} to={[556, 113]} marker="arrA" />
        <Node x={560} y={96} w={68} label="PetWall" sub=".app" color={T.green} />
      </svg>
    </Figure>
  );
}

function ModuleCacheFigure() {
  return (
    <Figure
      minWidth={600}
      caption="Without modules, every compiler invocation re-parses the same 800+ headers (over 9 MB of source) behind a single import of Foundation.h. With modules, Foundation is parsed once, cached on disk, and reused. The cache directory is named after a hash of the compiler arguments, so inconsistent flags mean rebuilding it."
    >
      <svg viewBox="0 0 660 230" style={{ width: "100%", display: "block" }} role="img" aria-label="Textual inclusion versus Clang modules">
        <ArrowMarker id="arrB" />
        <text x={170} y={22} textAnchor="middle" fontFamily={T.mono} fontSize="11" fill={T.red}>#include — every invocation pays</text>
        <text x={500} y={22} textAnchor="middle" fontFamily={T.mono} fontSize="11" fill={T.green}>modules — the first invocation pays</text>

        <Node x={16} y={40} w={120} label="PetCat.m" />
        <Node x={16} y={100} w={120} label="PetDog.m" />
        <Node x={16} y={160} w={120} label="PetBird.m" />
        {[57, 117, 177].map((y) => (
          <Arrow key={y} from={[140, y]} to={[192, y]} marker="arrB" />
        ))}
        <Node x={196} y={40} w={128} label="9 MB parsed" sub="800+ headers" h={38} color={T.red} />
        <Node x={196} y={100} w={128} label="9 MB parsed" sub="800+ headers" h={38} color={T.red} />
        <Node x={196} y={160} w={128} label="9 MB parsed" sub="800+ headers" h={38} color={T.red} />

        <line x1={340} y1={12} x2={340} y2={210} stroke={T.border} strokeDasharray="5 5" />

        <Node x={356} y={40} w={120} label="PetCat.m" />
        <Node x={356} y={100} w={120} label="PetDog.m" />
        <Node x={356} y={160} w={120} label="PetBird.m" />
        <Arrow from={[480, 57]} to={[532, 105]} marker="arrB" />
        <Arrow from={[480, 117]} to={[532, 117]} marker="arrB" />
        <Arrow from={[480, 177]} to={[532, 129]} marker="arrB" />
        <Node x={536} y={88} w={112} h={58} label="Foundation" sub="module cache" color={T.green} />
        <text x={592} y={168} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>keyed by a hash of</text>
        <text x={592} y={181} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>the compiler flags</text>
      </svg>
    </Figure>
  );
}

function InteropFigure() {
  return (
    <Figure
      minWidth={560}
      caption="Interop inside an app target: Objective-C reaches Swift through the bridging header, Swift reaches back through the compiler-generated header. In a framework the same two jobs fall to the umbrella header and a generated header that carries only public declarations."
    >
      <svg viewBox="0 0 640 200" style={{ width: "100%", display: "block" }} role="img" aria-label="Swift and Objective-C interop">
        <ArrowMarker id="arrC" />
        <rect x={16} y={16} width={608} height={168} rx={10} fill="none" stroke={T.border} strokeDasharray="5 5" />
        <text x={32} y={40} fontFamily={T.mono} fontSize="10.5" fill={T.dim}>PetWall app target</text>

        <Node x={48} y={64} w={210} h={84} label="PetViewController.swift" sub="Swift" color={T.teal} />
        <Node x={382} y={64} w={210} h={84} label="AppDelegate.m" sub="Objective-C" color={T.pink} />

        <Arrow from={[378, 88]} to={[262, 88]} marker="arrC" />
        <text x={320} y={80} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.yellow}>bridging header</text>

        <Arrow from={[262, 124]} to={[378, 124]} marker="arrC" />
        <text x={320} y={142} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.yellow}>PetWall-Swift.h (generated)</text>
      </svg>
    </Figure>
  );
}

function LinkerFigure() {
  return (
    <Figure
      minWidth={620}
      caption="Linking PetKit. cat.o is copied in and patched. Resolving playSound pulls PetSounds.o out of the static archive; PetCare.o, referenced by nothing, stays out. open() lives in libSystem, so nothing is copied: just a stub in __TEXT and a null pointer in __DATA, plus __LINKEDIT metadata telling dyld how to fill the pointer in at load time."
    >
      <svg viewBox="0 0 680 330" style={{ width: "100%", display: "block" }} role="img" aria-label="Linker inputs and output segments">
        <ArrowMarker id="arrD" />
        <Node x={20} y={30} w={150} h={38} label="cat.o" sub="from cat.mm" color={T.yellow} />

        <rect x={20} y={92} width={150} height={112} rx={8} fill={T.bg} stroke={T.border} />
        <text x={32} y={110} fontFamily={T.mono} fontSize="10.5" fill={T.dim}>PetSupport.a</text>
        <Node x={32} y={120} w={126} h={32} label="PetSounds.o" color={T.green} />
        <Node x={32} y={160} w={126} h={32} label="PetCare.o" color={T.dim} />
        <text x={95} y={218} textAnchor="middle" fontFamily={T.mono} fontSize="9" fill={T.dim}>not referenced — stays out</text>

        <Node x={20} y={240} w={150} h={38} label="libSystem.tbd" sub="symbol names only" color={T.teal} />

        <rect x={360} y={24} width={300} height={284} rx={10} fill={T.bg} stroke={T.border} />
        <text x={376} y={46} fontFamily={T.mono} fontSize="11" fill={T.text}>PetKit — Mach-O</text>

        <rect x={376} y={58} width={268} height={122} rx={6} fill={T.panelRaised} stroke={T.border} />
        <text x={392} y={76} fontFamily={T.mono} fontSize="10.5" fill={T.pink}>__TEXT</text>
        <text x={392} y={96} fontFamily={T.mono} fontSize="10.5" fill={T.red}>"purr.aac"  __cstring</text>
        <text x={392} y={114} fontFamily={T.mono} fontSize="10.5" fill={T.text}>-[Cat purr]</text>
        <text x={392} y={132} fontFamily={T.mono} fontSize="10.5" fill={T.text}>_playSound  ← PetSounds.o</text>
        <text x={392} y={150} fontFamily={T.mono} fontSize="10.5" fill={T.text}>open$stub → jumps via open$ptr</text>

        <rect x={376} y={190} width={268} height={50} rx={6} fill={T.panelRaised} stroke={T.border} />
        <text x={392} y={208} fontFamily={T.mono} fontSize="10.5" fill={T.yellow}>__DATA</text>
        <text x={392} y={226} fontFamily={T.mono} fontSize="10.5" fill={T.text}>open$ptr = 0x0  (dyld fills in)</text>

        <rect x={376} y={250} width={268} height={48} rx={6} fill={T.panelRaised} stroke={T.border} />
        <text x={392} y={268} fontFamily={T.mono} fontSize="10.5" fill={T.teal}>__LINKEDIT</text>
        <text x={392} y={286} fontFamily={T.mono} fontSize="10.5" fill={T.text}>fixup metadata for dyld</text>

        <Arrow from={[174, 49]} to={[372, 100]} marker="arrD" />
        <Arrow from={[162, 136]} to={[372, 132]} marker="arrD" />
        <Arrow from={[174, 259]} to={[372, 226]} marker="arrD" dashed />
        <text x={268} y={252} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>nothing copied — just a name</text>
      </svg>
    </Figure>
  );
}

// ————————————————————————————————————————————————
// The article
// ————————————————————————————————————————————————
export default function BuildProcessArticle() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans, paddingBottom: 80 }}>
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: ${T.pink}44; }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 10, background: `${T.panel}F2`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "10px 16px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[T.red, T.yellow, T.green].map((c, i) => (
              <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }} />
            ))}
          </div>
          <a href="#/" style={{ fontFamily: T.mono, fontSize: 12.5, color: T.dim, textDecoration: "none" }}>← ToolchainInternals</a>
          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 12, color: T.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            wwdc2018-415.article
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "36px 16px 0" }}>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, marginBottom: 8 }}>// WWDC18 · Session 415 · full write-up from the transcript</div>
        <h1 style={{ fontFamily: T.mono, fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 600, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.25 }}>
          Behind the Scenes of the Xcode Build Process
        </h1>
        <p style={{ color: T.dim, fontSize: 14, margin: "14px 0 0", lineHeight: 1.6 }}>
          Four engineers walk the pipeline end to end: Jake Petroules on the build system, Jurgen on Clang, Devin on the Swift compiler's
          bookkeeping, and Louis Gerbarg on the linker. The running example is PetWall, a small iOS app that shows photos of pets, built from a
          Swift app target, an Objective-C framework called PetKit, and a C++ static library called PetSupport. An ordinary project, which is
          the point. <A href="https://developer.apple.com/videos/play/wwdc2018/415/">Watch the session</A> if you'd rather have the 55-minute version.
        </p>

        {/* ————— 01 · Build system ————— */}
        <Kicker>01 · Jake Petroules · Xcode build system team</Kicker>
        <H2>What happens when you press ⌘B</H2>

        <P>
          A build takes the source and resources in your project and turns them into the package you ship. That means compiling and linking
          source code; copying and processing resources like headers, asset catalogues and storyboards; code signing; and whatever custom work
          you've bolted on in shell script phases, like generating API documentation or running a linter.
        </P>
        <P>
          Nearly all of it happens by running command line tools: <C>clang</C>, <C>ld</C>, <C>actool</C>, <C>ibtool</C>, <C>codesign</C>. Each
          has to be invoked with a very specific set of arguments, in a particular order, based on how your project is configured. A complex
          project can involve tens of thousands of tasks. The build system exists to orchestrate all of that. In Jake's words, it's not
          something you want to be manually typing into the terminal 110 times a day.
        </P>

        <H3>Dependency order</H3>
        <P>
          The order comes from dependency information: what each task consumes and what it produces. A compile task consumes{" "}
          <C>PetController.m</C> and produces <C>PetController.o</C>. The link task consumes every object file the compilers produced and emits
          the PetWall executable that goes into the .app bundle. Each compile task is independent of the others (Jake's image is lanes of
          traffic), so they can all run in parallel; the linker takes everyone else's output, so it has to run last. Nobody sorts the
          tasks by hand; the order falls out of the graph.
        </P>
        <P>
          Concretely, when you press ⌘B the build system parses the build description (your project file, with its targets, dependency
          relationships and build settings) into a directed graph of input files, tasks and output files. A low-level execution engine then
          walks that graph, works out which tasks need to run, in what order, with how much parallelism, and executes them. That engine is
          called <A href="https://github.com/swiftlang/swift-llbuild">llbuild</A>, and it's open source.
        </P>

        <BuildGraphFigure />

        <H3>Incremental builds are just hashes</H3>
        <P>
          You don't want to run tens of thousands of tasks on every build, so the build system runs a subset: the tasks affected by what
          changed. Detection is simple. Every task has a signature: a hash of its inputs' stat info (file paths, modification timestamps), the
          full command line, and task-specific metadata like the version of the compiler. The build system remembers each task's signature from
          the previous build. Different signature: the task reruns. Same signature: it's skipped. That's the entire mechanism.
        </P>
        <P>
          Dependency information also grows during the build. When Clang compiles an Objective-C file it can emit a second file alongside the
          .o: a listing of every header that source file included. On the next build, the build system uses it to recompile the file if any of
          those headers changed. You can never have too much dependency information.
        </P>

        <H3>Where dependencies come from</H3>
        <P>
          The practical upshot: your job is not to think about the order things build in. Your job is to give the build system accurate
          dependencies, and let it derive ordering and parallelism itself so it can use every core you paid for. Dependency information comes
          from several places.
        </P>
        <UL
          items={[
            <>Built-in rules. The build system ships knowing what the compilers, the linker, and the asset catalogue and storyboard processors accept and produce.</>,
            <>Target dependencies, which roughly order whole targets. New in Xcode 10, a target's compile sources phase can start before its dependencies have completely finished (parallelisation for free), but any run script phase in the dependency has to finish first, so scripts hold this up.</>,
            <>Implicit dependencies. If a target appears in your Link Binary with Libraries phase and "find implicit dependencies" is on in the scheme editor (it is by default), the build system treats it as a dependency even if you never listed it under Target Dependencies.</>,
            <>Build phase order. The tasks for each phase — copy headers, compile sources, copy bundle resources — usually run as groups in the order the phases are listed, though the build system will ignore that order when it knows better. A wrong phase order can genuinely break a build, so check yours.</>,
            <>Scheme order. With Parallelize Build ticked, the order of targets in your scheme is irrelevant and performance is better. Untick it and Xcode builds targets one at a time in scheme order (target dependencies still win). That's tempting as a crutch when dependencies aren't set up properly, but you're paying for it in wall-clock time. Leave it on and set real dependencies.</>,
            <>You. Custom script phases and build rules only cooperate with incremental builds if you declare their inputs and outputs in the run script phase editor — the paths are handed to your script as environment variables. Undeclared scripts rerun on every build and can land in the wrong order.</>,
          ]}
        />
        <Callout color={T.red} label="auto-link won't save you">
          Clang's auto-link feature (the Link Frameworks Automatically setting) makes the compiler link whatever frameworks correspond to the
          modules you import, without you listing them in the link phase. But it creates no dependency at the build system level, so nothing
          guarantees the framework you're importing has actually been built yet. Rely on it only for platform SDK frameworks like Foundation and
          UIKit, which exist before your build starts. For your own targets, add explicit dependencies. If a target lives in another
          project, drag it into your file navigator so its targets are visible at all.
        </Callout>

        {/* ————— 02 · Clang ————— */}
        <Kicker>02 · Jurgen · Clang frontend team</Kicker>
        <H2>Headers, headermaps and the nine-megabyte include</H2>

        <P>
          Clang is Apple's compiler for the C family: C, C++ and Objective-C, which is still what most of the system frameworks are written
          in. Even if you write nothing but Swift, this section concerns you, because Swift uses Clang behind the scenes. Clang is invoked once
          per implementation file and produces exactly one object file, which the linker consumes later.
        </P>
        <P>
          A header file is a promise: you promise that this implementation exists somewhere else. Break the promise — change the
          implementation, forget the header — and the compiler usually won't notice, because it trusts you. The break surfaces at link time.
        </P>

        <H3>Headermaps</H3>
        <P>
          At some point the PetWall team reorganised the project and moved all the cat-related files into a subfolder. No implementation file
          changed, and everything still built. So how did <C>{'#include "Cat.h"'}</C> keep working? You can answer that yourself: copy the
          compile invocation for the file out of the build log, paste it into a terminal, and add <C>-v</C>. Most of the output is noise; the
          interesting part is the header search paths. They don't point at your source directory. They point at headermaps: files the
          build system generates to tell Clang where your headers actually live.
        </P>
        <P>
          Two kinds of entry matter. Entries that prepend the framework name let you include your framework's public and private
          headers without writing the framework prefix. That's a compatibility feature for old projects and it can go wrong with modules, so
          always write the qualified form, <C>{'#import <PetKit/Cat.h>'}</C>. And entries for project headers point back at your source
          directory rather than at any copy in the build directory, so errors and warnings land in the file you actually
          edit.
        </P>
        <Callout color={T.yellow} label="two classic headermap surprises">
          A header that sits in your source directory but was never added to the project isn't in the headermap, and won't be found. And
          headers with the same name shadow each other — including system headers: a local header named like an SDK header silently wins. Add
          your headers to the project, and keep the names unique.
        </Callout>

        <H3>Finding system headers</H3>
        <P>
          Headermaps only describe your own headers. For <C>{'#import <Foundation/Foundation.h>'}</C>, Clang falls back to two places in the
          SDK. First <C>usr/include</C>, a regular include directory: append the search term, look, not there, move on. Then{" "}
          <C>System/Library/Frameworks</C>, which works differently: Clang first identifies the framework and checks it exists, then looks in
          its <C>Headers</C> directory, then in <C>PrivateHeaders</C> (Apple ships no private headers in the SDK, but your frameworks might
          have them). The catch: once the framework has been found, a header that isn't in it ends the search. Clang will not fall through to
          other search directories; if the framework exists, its headers are expected to be in it.
        </P>

        <H3>The problem modules solve</H3>
        <P>
          Ask Xcode for the preprocessed version of a file that imports <C>Foundation.h</C> and you can watch the cost: over 800 header files,
          more than nine megabytes of source, parsed and verified. Foundation is so fundamental that nearly every file pulls it in directly or
          indirectly, and that work used to happen for every single compiler invocation. Redundantly. Precompiled headers were one answer;
          Clang modules are the better one: find and parse a framework's headers once, store the result on disk, reuse it everywhere.
        </P>

        <ModuleCacheFigure />

        <P>
          The cache only works because modules obey two rules. They are context-free: a <C>#define</C> you wrote above the import does not leak
          into the module, because the surrounding preprocessor context is ignored; otherwise every importing file could produce a different
          module and nothing could be shared. And they are self-contained: a module declares all of its dependencies, which is why importing
          one just works without chasing extra includes.
        </P>
        <P>
          How does Clang know <C>NSString.h</C> belongs to a module? Having found the header in <C>Foundation.framework</C>, it looks for a
          Modules directory with a module map next to the headers. The module map names the module and lists its headers — Foundation's is
          essentially one entry, a special header marked with the <C>umbrella</C> keyword. Clang reads that umbrella header to confirm{" "}
          <C>NSString.h</C> is part of the module, then upgrades your textual import to a module import.
        </P>
        <CodeBlock title="module.modulemap — Foundation's, roughly">{`framework module Foundation {
  umbrella header "Foundation.h"
  export *
}`}</CodeBlock>
        <P>
          Building the module means a separate Clang invocation containing the module's headers and none of your file's context. The one thing
          carried over is the command line arguments, and that detail matters. Frameworks the module imports get built as modules too,
          recursively, with plenty of reuse along the way, and everything lands in the module cache on disk in a directory named after a hash
          of those arguments. Change the arguments for one implementation file (enable a macro, tweak a flag) and you've changed the hash,
          and Clang rebuilds every module under it. For maximum reuse, keep compiler flags consistent across your files.
        </P>
        <P>
          Your own frameworks have a wrinkle: during development the headermap points at your source directory, which doesn't look like a
          framework at all: no Modules directory, nothing for Clang to recognise. Clang's virtual file system solves it by fabricating a
          framework-shaped view whose entries point back at your real files, so modules build and diagnostics still land in your actual source.
        </P>
        <P>
          And here is the concrete reason to framework-qualify imports. Import the PetKit module, then <C>{'#import "Cat.h"'}</C> below it. You
          know Cat.h is part of PetKit; Clang may not be able to tell. Now the same header exists both inside a module and as a textual
          inclusion, and you can get duplicate definition errors. Add a macro above the imports and it gets worse: the textual copy observes
          the macro, the module ignores it, and the two copies contradict each other. Clang works hard behind the scenes to patch up the common
          cases, but it cannot fix them all.
        </P>

        {/* ————— 03 · Swift ————— */}
        <Kicker>03 · Devin · Swift compiler</Kicker>
        <H2>How Swift finds declarations without headers</H2>

        <P>
          Clang compiles each Objective-C file in isolation; to use a class defined elsewhere, you import a header that declares it. Swift was
          designed to not need headers (easier for beginners, and no declaration written twice), which means the compiler takes on the
          bookkeeping that headers used to do. Compiling even a single file, <C>PetViewController.swift</C>, involves four jobs: finding
          declarations elsewhere in the Swift target, finding declarations from Objective-C, generating an interface for Objective-C to use,
          and generating an interface for other Swift targets.
        </P>

        <H3>Within a target</H3>
        <P>
          To type-check a call to PetView's initialiser, the compiler parses <C>PetView.swift</C> and validates that declaration — not the
          initialiser's body, just the interface parts. But unlike Clang, compiling one Swift file means parsing every other file in the
          target. In Xcode 9 each file was compiled separately, which was good for parallelism and bad for repetition: every file got parsed
          once as an implementation to produce its .o, and repeatedly as an interface for the others. Xcode 10 combines files into groups that
          share that parsing while the groups still run in parallel; the number of groups stays small, so incremental debug builds got
          noticeably faster.
        </P>

        <H3>Importing Objective-C into Swift</H3>
        <P>
          Swift doesn't ask you to write foreign-function-interface declarations for Objective-C APIs. Instead the compiler embeds a large part
          of Clang inside itself, as a library, and imports Objective-C frameworks directly. Where the importer looks depends on the target:
          for any imported framework, the headers exposed in that framework's module map; inside a mixed-language framework, the umbrella
          header, so Swift can call the framework's own public Objective-C; and in apps and unit tests, whatever you've put in the bridging
          header.
        </P>
        <P>
          Imported APIs get reshaped to feel like Swift. Methods using the NSError idiom become throwing methods. Parameter type names that
          follow verbs and prepositions are dropped, so <C>drawPet(atPoint:)</C> imports as <C>draw(at:)</C>. The mechanism is more honest than
          you'd guess: the compiler contains a hard-coded list of common English verbs and prepositions. Human language being messy, the list
          misses words: <C>feed</C> isn't on it, so <C>feedPet</C> doesn't import as <C>feed()</C>. When a rename comes out wrong, take
          control with <C>NS_SWIFT_NAME</C>. And you can always see exactly what Swift will see: the Generated Interfaces view in the related
          items popup, top-left of the source editor.
        </P>

        <H3>Importing Swift into Objective-C</H3>
        <P>
          The reverse direction runs through a header the compiler writes for you. It contains Objective-C declarations for Swift classes
          extending NSObject and members marked <C>@objc</C>. In apps and unit tests the generated header includes both public and internal
          declarations, so the Objective-C parts of your app can use internal Swift. In frameworks it's public-only, because the header ships
          in your build products as part of the framework's interface. The generated class is tied to the mangled Swift name, which includes
          the module name; that's what stops two modules that both declare a PetCollar from colliding in the runtime. You can pick the
          Objective-C name yourself with <C>@objc(PWLPetCollar)</C>, at which point avoiding collisions is your job; hence the prefix.
        </P>

        <InteropFigure />

        <H3>Swift modules</H3>
        <P>
          For Swift-to-Swift, the compiler takes Clang's module concept and integrates it more deeply into the language. A module is a
          distributable unit of declarations, imported to be used. Every Swift target in Xcode produces its own module, including the app
          target; that's why unit tests import the app's module. Importing one makes the compiler deserialise a <C>.swiftmodule</C> file: a
          binary summary of the whole module, read instead of parsing the module's sources. In effect a generated header, but binary.
        </P>
        <P>
          Two things in that file are easy to miss. It includes the bodies of inlineable functions, much like static inline
          functions in C or header implementations in C++. And it includes the names and types of private declarations. That's what lets
          you refer to them in the debugger, and why Devin advises against naming a private variable after your deepest, darkest secret.
        </P>
        <P>
          In incremental builds each file produces a partial module, and the compiler merges the partials into a single file representing the
          whole target, the same merge that makes the single generated Objective-C header possible. Which is, as Devin put it, a lot like
          what the linker does when it smooshes your object files together into an executable. Speaking of which.
        </P>

        {/* ————— 04 · Linker ————— */}
        <Kicker>04 · Louis Gerbarg · linker</Kicker>
        <H2>The linker moves and patches — it never creates</H2>

        <P>
          The linker is one of the final steps in the build: it combines the object files produced by both compilers into the executable for
          your app or framework. It operates under one constraint that explains almost everything about its behaviour: it can move code and
          patch code, but it cannot create code.
        </P>

        <H3>Symbols</H3>
        <P>
          A symbol is a name that refers to a fragment of code or data. Fragments refer to other symbols — write a function that calls another
          function and you've made one. Symbols carry attributes that change how the linker treats them. The one to know is the weak
          symbol: an annotation meaning "this might not exist at runtime". All the availability markup in the SDK (this API exists on iOS 12,
          that one on iOS 11) boils down to weak symbols by the time it reaches the linker, which then knows what is definitely present versus
          what has to be dealt with at runtime.
        </P>
        <P>
          Languages also encode extra information into the symbol names themselves, a practice called mangling. Both C++ and Swift do it. Meet <C>__Z9playSoundPKc</C>:
        </P>
        <CodeBlock title="terminal">{`$ xcrun swift-demangle __Z9playSoundPKc
__Z9playSoundPKc          # not a Swift symbol — no luck

$ c++filt __Z9playSoundPKc
playSound(char const*)`}</CodeBlock>
        <P>
          Not just the name: the argument type came back too, because C++ folds it into the symbol.
        </P>

        <H3>What the linker eats</H3>
        <UL
          items={[
            <>Object files are the compilers' output: collections of code and data fragments, each represented by a symbol. They're compiled but unfinished — references to symbols in other files stay undefined until the linker resolves them.</>,
            <>Dylibs are Mach-O dynamic libraries that expose code and data fragments for executables to use. The system frameworks are these; some of yours probably are too.</>,
            <>TBDs, or text-based dylib stubs, exist because shipping a full copy of every dylib in the SDK would be enormous and the linker only needs names, not bodies. So the SDK carries stubs: the symbols in textual form, bodies deleted. You'll see them in builds; you can ignore them.</>,
            <>Static archives are .a files made with <C>ar</C> (or its wrapper <C>libtool</C>). The format is essentially a tar file: it's the original UNIX archive format, from before dynamic linking existed, and toolchains have simply kept understanding it.</>,
          ]}
        />
        <Callout color={T.yellow} label="static archives load selectively">
          An archive member is only pulled into your binary if something references a symbol in it; the pull is transitive, so everything you
          actually need comes along. Members referenced by nothing stay out. If a member matters for non-symbol reasons (a static initialiser, or
          re-exporting the archive from your own dylib) you need <C>-force_load</C> or <C>-all_load</C> to bring it in anyway.
        </Callout>

        <H3>Worked example: linking PetKit</H3>
        <P>
          Cat has a purr method that plays <C>purr.aac</C> by calling <C>playSound</C>, in <C>cat.mm</C>, an Objective-C++ file. Here's
          roughly what the compiler leaves in <C>cat.o</C>:
        </P>
        <CodeBlock title="cat.o — simplified arm64">{`        .section  __TEXT,__cstring
l_.str: .asciz    "purr.aac"        ; static ⇒ name not exported

        .section  __TEXT,__text
"-[Cat purr]":
        adrp      x0, l_.str@PAGE      ; address unknown until link
        add       x0, x0, l_.str@PAGEOFF   ; time — two instructions,
        bl        __Z9playSoundPKc     ; the arm64 worst case`}</CodeBlock>
        <P>
          Three things to notice. The string's variable name appears nowhere: it was declared <C>static</C>, which means non-exported, and a name
          nothing else can refer to isn't needed. The method <C>-[Cat purr]</C> became a symbol. And loading the
          string's address takes two instructions carrying symbolic PAGE and PAGEOFF values, because the compiler has no idea where the string
          will land in the final binary; it emits the worst case and leaves the linker to patch it.
        </P>
        <P>
          The linker starts the PetKit output file with a __TEXT segment (where all the code of an application lives) and copies cat.o in,
          split into a string section and a code section. Addresses are now concrete, so it rewrites the load to a real offset. The second
          instruction is no longer needed, but it can't be deleted: the sizing is already done, and removing code isn't in the linker's
          vocabulary. It gets overwritten with a <C>nop</C> instead.
        </P>
        <P>
          <C>playSound</C> is still undefined, and every .o input has been consumed, so the search moves to the static archives.{" "}
          <C>PetSupport.a</C> contains <C>PetSounds.o</C>, which defines the symbol: pulled in, along with anything it needs. The archive also
          contains <C>PetCare.o</C>, which nothing references: left out.
        </P>
        <P>
          PetSounds.o calls <C>open()</C>, which turns up in libSystem's TBD, and a TBD has no bodies to copy. Instead the linker plants{" "}
          <C>open$stub</C>, a small template function that loads a plain function pointer, <C>open$ptr</C>, from the __DATA segment (where
          globals live) and jumps through it. At link time that pointer is zero: jump through it as-is and you dereference null and crash. The
          linker can't fix that — the real <C>open()</C> isn't in your binary at all.
        </P>
        <P>
          So it writes one more segment: __LINKEDIT, metadata describing how the operating system's dynamic linker should fix those pointers
          up when the app loads. That handoff — from build-time linking to dyld at runtime — is a story of its own, told in Optimizing App
          Startup Time from WWDC 2016.
        </P>

        <LinkerFigure />

        {/* ————— Wrap-up ————— */}
        <Kicker>wrap-up</Kicker>
        <H2>The homework</H2>
        <P>
          One pass through the whole pipeline: the build system turns your project into a task graph and reruns only what changed; Clang finds
          headers through headermaps and caches parsed frameworks as modules; Swift does the bookkeeping
          that headers used to do; and the linker glues the object files into something dyld can finish at launch. The advice that
          falls out of it:
        </P>
        <UL
          items={[
            <>Set explicit target dependencies. Don't lean on scheme order, and don't trust auto-link for your own targets.</>,
            <>Keep Parallelize Build on.</>,
            <>Declare inputs and outputs on every run script phase.</>,
            <>Add headers to the project, keep their names unique, and framework-qualify public and private header imports.</>,
            <>Keep compiler flags consistent across files, or pay for it in module cache rebuilds.</>,
            <>Use <C>NS_SWIFT_NAME</C> when the importer's renaming misses, and check the result in Generated Interfaces.</>,
            <>Remember the .swiftmodule ships the names of your private declarations.</>,
          ]}
        />
        <P>
          Most of this machinery is open source — <A href="https://github.com/swiftlang/swift">swift</A>,{" "}
          <A href="https://github.com/llvm/llvm-project">clang</A> and the{" "}
          <A href="https://github.com/swiftlang/swift-llbuild">llbuild</A> execution engine are all on GitHub — and the session itself is{" "}
          <A href="https://developer.apple.com/videos/play/wwdc2018/415/">55 minutes well spent</A>.
        </P>

        <div style={{ marginTop: 48, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <a href="#/" style={{ fontFamily: T.mono, fontSize: 13, color: T.pink, textDecoration: "none" }}>← back to the dashboard</a>
        </div>
      </main>
    </div>
  );
}
