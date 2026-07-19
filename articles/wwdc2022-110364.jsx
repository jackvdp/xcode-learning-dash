import { T } from "../theme.js";
import { C, A, PageLink, Figure, Node, Arrow, ArrowMarker } from "../components/article.jsx";

// ————————————————————————————————————————————————
// Content for "Demystify parallelization in Xcode builds"
// (WWDC22 session 110364). Text and diagrams only — the
// generic renderer in article.jsx owns all presentation.
// ————————————————————————————————————————————————

// ————————————————————————————————————————————————
// Diagrams
// ————————————————————————————————————————————————
function CriticalPathFigure() {
  return (
    <Figure
      minWidth={600}
      caption="Finishing A unblocks B and C (its downstream tasks); D and E can't start until B, their upstream task, is done. The pink route is the critical path: the longest chain of dependent tasks. With unlimited cores the build still can't finish faster than this chain, so making a build scale means breaking one of its edges."
    >
      <svg viewBox="0 0 640 216" style={{ width: "100%", display: "block" }} role="img" aria-label="Task dependency graph with the critical path highlighted">
        <ArrowMarker id="pzA" />
        <defs>
          <marker id="pzApink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill={T.pink} />
          </marker>
        </defs>

        <Node x={20} y={88} w={104} label="A" sub="compile" />
        <Node x={216} y={28} w={104} label="B" sub="copy files" />
        <Node x={216} y={148} w={104} label="C" sub="assets" />
        <Node x={412} y={8} w={104} label="D" sub="codesign" />
        <line x1={128} y1={100} x2={208} y2={52} stroke={T.pink} strokeWidth="1.4" markerEnd="url(#pzApink)" />
        <Arrow from={[128, 122]} to={[208, 160]} marker="pzA" />
        <Arrow from={[324, 38]} to={[404, 28]} marker="pzA" />
        <line x1={324} y1={54} x2={404} y2={96} stroke={T.pink} strokeWidth="1.4" markerEnd="url(#pzApink)" />
        <Node x={412} y={88} w={104} label="E" sub="link" color={T.teal} />
        <line x1={520} y1={105} x2={548} y2={105} stroke={T.pink} strokeWidth="1.4" markerEnd="url(#pzApink)" />
        <Node x={556} y={88} w={70} label=".app" color={T.green} />

        <text x={70} y={72} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>upstream</text>
        <text x={464} y={210} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>downstream</text>
      </svg>
    </Figure>
  );
}

function TimelineFigure() {
  return (
    <Figure
      minWidth={600}
      caption="What the Xcode 14 build timeline shows. Each row is a task; the number of rows at any moment is how much was running in parallel right then. Width is duration, colour is the target the task belongs to. The dashed region is the thing to hunt for: cores sitting idle because every runnable task is waiting on an input that some long task hasn't produced yet."
    >
      <svg viewBox="0 0 640 206" style={{ width: "100%", display: "block" }} role="img" aria-label="Anatomy of the build timeline">
        {/* row 1 */}
        <rect x={20} y={24} width={236} height={26} rx={4} fill={T.pink} opacity="0.75" />
        <rect x={380} y={24} width={200} height={26} rx={4} fill={T.pink} opacity="0.75" />
        {/* row 2 */}
        <rect x={20} y={58} width={104} height={26} rx={4} fill={T.teal} opacity="0.75" />
        <rect x={132} y={58} width={124} height={26} rx={4} fill={T.teal} opacity="0.75" />
        <rect x={380} y={58} width={120} height={26} rx={4} fill={T.teal} opacity="0.75" />
        {/* row 3 */}
        <rect x={20} y={92} width={148} height={26} rx={4} fill={T.yellow} opacity="0.75" />
        <rect x={380} y={92} width={84} height={26} rx={4} fill={T.yellow} opacity="0.75" />
        {/* row 4 */}
        <rect x={20} y={126} width={88} height={26} rx={4} fill={T.green} opacity="0.75" />

        <rect x={266} y={20} width={104} height={138} rx={6} fill="none" stroke={T.red} strokeDasharray="5 5" />
        <text x={318} y={176} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.red}>stall — everything is</text>
        <text x={318} y={189} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.red}>waiting on one task</text>

        <line x1={20} y1={160} x2={620} y2={160} stroke={T.border} />
        <text x={600} y={176} textAnchor="end" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>time →</text>
      </svg>
    </Figure>
  );
}

function ScriptRaceFigure() {
  return (
    <Figure
      minWidth={620}
      caption="The talk's worked example. Both scripts declare input.txt, but Generate HTML forgot to declare checksum.txt as an input. Xcode sees no edge between the two scripts, so with FUSE_BUILD_SCRIPT_PHASES on it runs them in parallel: on a clean build checksum.txt doesn't exist yet, on an incremental build it's last build's stale copy. The sandbox turns that silent race into a hard failure that names the file."
    >
      <svg viewBox="0 0 660 216" style={{ width: "100%", display: "block" }} role="img" aria-label="Two script phases with an undeclared dependency">
        <ArrowMarker id="pzB" />
        <defs>
          <marker id="pzBred" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill={T.red} />
          </marker>
        </defs>

        <Node x={20} y={88} w={112} label="input.txt" sub="source root" />
        <Node x={216} y={24} w={172} h={40} label="Calculate Checksum" sub="run script" color={T.yellow} />
        <Node x={216} y={152} w={172} h={40} label="Generate HTML" sub="run script" color={T.yellow} />
        <Node x={472} y={24} w={168} h={40} label="checksum.txt" sub="DERIVED_FILE_DIR" />
        <Node x={472} y={152} w={168} h={40} label="report.html" color={T.green} />

        <Arrow from={[136, 96]} to={[208, 52]} marker="pzB" />
        <Arrow from={[136, 114]} to={[208, 164]} marker="pzB" />
        <Arrow from={[392, 44]} to={[464, 44]} marker="pzB" />
        <Arrow from={[392, 172]} to={[464, 172]} marker="pzB" />
        <line x1={548} y1={68} x2={396} y2={158} stroke={T.red} strokeWidth="1.4" strokeDasharray="4 4" markerEnd="url(#pzBred)" />
        <text x={512} y={124} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.red}>undeclared input</text>
      </svg>
    </Figure>
  );
}

function EmitModuleFigure() {
  return (
    <Figure
      minWidth={620}
      caption="Time runs left to right. Before Xcode 14, target B couldn't start compiling until every one of A's compile sub-tasks finished and a merge step assembled the module from their partial products. In Xcode 14 with Swift 5.7, a dedicated emit-module task builds the module straight from the source files, so B starts while A's compiles are still chewing."
    >
      <svg viewBox="0 0 660 226" style={{ width: "100%", display: "block" }} role="img" aria-label="Module emission before and after Xcode 14">
        <text x={160} y={22} textAnchor="middle" fontFamily={T.mono} fontSize="11" fill={T.red}>before — merge waits for everyone</text>
        <text x={496} y={22} textAnchor="middle" fontFamily={T.mono} fontSize="11" fill={T.green}>Xcode 14 — emit-module up front</text>

        <rect x={16} y={36} width={288} height={176} rx={8} fill="none" stroke={T.border} strokeDasharray="5 5" />
        <rect x={352} y={36} width={288} height={176} rx={8} fill="none" stroke={T.border} strokeDasharray="5 5" />

        {/* before */}
        <Node x={28} y={48} w={96} h={28} label="compile a" />
        <Node x={28} y={84} w={116} h={28} label="compile b" />
        <Node x={28} y={120} w={104} h={28} label="compile c" />
        <Node x={156} y={84} w={72} h={28} label="merge" color={T.yellow} />
        <Node x={240} y={48} w={56} h={28} label="B…" color={T.pink} />
        <text x={166} y={196} fontFamily={T.mono} fontSize="9.5" fill={T.dim} textAnchor="middle">B waits for a + b + c + merge</text>

        {/* after */}
        <Node x={364} y={48} w={104} h={28} label="emit-module" color={T.teal} />
        <Node x={364} y={84} w={116} h={28} label="compile a" />
        <Node x={364} y={120} w={104} h={28} label="compile b" />
        <Node x={364} y={156} w={110} h={28} label="compile c" />
        <Node x={480} y={48} w={148} h={28} label="B compiles" color={T.pink} />
        <text x={502} y={196} fontFamily={T.mono} fontSize="9.5" fill={T.dim} textAnchor="middle">B starts as soon as the module exists</text>
      </svg>
    </Figure>
  );
}

function EagerLinkingFigure() {
  return (
    <Figure
      minWidth={600}
      caption="B links against A. Normally B's link task needs A's finished linked product, so the two link tasks queue up on the critical path. With eager linking, A's emit-module task also produces a text-based dylib stub — a list of the symbols the real product will contain — and B links against that instead, in parallel with A's own link."
    >
      <svg viewBox="0 0 640 236" style={{ width: "100%", display: "block" }} role="img" aria-label="Eager linking before and after">
        <ArrowMarker id="pzC" />
        <text x={150} y={22} textAnchor="middle" fontFamily={T.mono} fontSize="11" fill={T.red}>normal — links queue up</text>
        <text x={480} y={22} textAnchor="middle" fontFamily={T.mono} fontSize="11" fill={T.green}>eager — links overlap</text>
        <line x1={320} y1={12} x2={320} y2={224} stroke={T.border} strokeDasharray="5 5" />

        {/* normal */}
        <Node x={20} y={40} w={112} h={30} label="compile A" />
        <Node x={20} y={106} w={112} h={30} label="link A" color={T.teal} />
        <Node x={20} y={172} w={112} h={30} label="A.dylib" color={T.green} />
        <Arrow from={[76, 70]} to={[76, 100]} marker="pzC" />
        <Arrow from={[76, 136]} to={[76, 166]} marker="pzC" />
        <Node x={176} y={106} w={112} h={30} label="compile B" />
        <Arrow from={[132, 187]} to={[212, 142]} marker="pzC" />
        <Node x={176} y={40} w={112} h={30} label="link B — waits" color={T.red} />
        <Arrow from={[232, 100]} to={[232, 76]} marker="pzC" />

        {/* eager */}
        <Node x={352} y={40} w={128} h={30} label="emit-module A" color={T.teal} />
        <Node x={352} y={106} w={128} h={30} label="A.tbd stub" sub="symbol names" color={T.yellow} />
        <Arrow from={[416, 70]} to={[416, 100]} marker="pzC" />
        <Node x={352} y={172} w={128} h={30} label="link A" color={T.teal} />
        <Node x={512} y={106} w={108} h={30} label="link B" color={T.green} />
        <Arrow from={[480, 121]} to={[504, 121]} marker="pzC" />
        <text x={484} y={196} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>link A and link B run at the same time</text>
      </svg>
    </Figure>
  );
}

// ————————————————————————————————————————————————
// The article
// ————————————————————————————————————————————————
export default {
  id: "wwdc2022-110364",
  breadcrumb: "wwdc2022-110364.article",
  eyebrow: "WWDC22 · Session 110364 · full write-up from the transcript",
  title: "Demystify Parallelization in Xcode Builds",
  lede: (
    <>
      The 2022 sequel to the build process session. Ben, from the Xcode build system team, covers where a build's task order comes from and
      how to read the new build timeline; Artem, from the Swift compiler team, explains what Xcode 14 changed so that many-target Swift
      builds stop tripping over each other. <A href="https://developer.apple.com/videos/play/wwdc2022/110364/">Watch the session</A> for the
      half-hour version. It leans on the task-graph idea from the{" "}
      <PageLink href="#/wwdc2018-415">2018 session</PageLink>, so read that write-up first if you haven't.
    </>
  ),
  blocks: [
    // ————— 01 · Core concepts —————
    { type: "kicker", text: "01 · Ben · Xcode build system team" },
    { type: "h2", text: "The graph, one more time" },
    {
      type: "p",
      content: (
        <>
          Press ⌘B and the build system gets handed a representation of your whole project: source files, assets, build settings, plus
          configuration like the run destination. It's the single source of truth about how the app gets built. It knows which tools to
          invoke, with which settings, and which intermediate files to produce along the way. The compilers, Clang and Swift, turn sources
          into object files; the linker combines those and adds references to external libraries to produce the executable.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          That ordering isn't written down anywhere. It falls out of what tasks consume and produce: the compiler produces object files, the
          linker consumes them, so the linker waits. The build system never looks inside the files. It only cares about the edges, and its
          one job during execution is making sure a task that produces another task's input finishes before that task starts. Tasks a
          finished task unblocks are its <em>downstream</em>; the tasks blocking you are your <em>upstream</em>.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          Targets stack another layer of dependencies on top, declared explicitly in the project or picked up implicitly, for instance when a
          framework appears in a Link Binary with Libraries build phase. In the session's example an app embeds an app extension and links a
          framework; the extension doesn't use the framework, so there's no edge between them, and nothing about one can ever block the
          other. On top of all this sits the incremental build: any task whose inputs haven't changed, and whose output is still up to date,
          gets skipped. (The 2018 session explains the signature mechanism behind that;{" "}
          <PageLink href="#/wwdc2018-415">it's just hashes</PageLink>.)
        </>
      ),
    },
    { type: "h3", text: "The critical path" },
    {
      type: "p",
      content: (
        <>
          Tasks take wildly different amounts of time. Compiling a big target takes a while; copying a few headers doesn't. Stack the
          dependency edges against those durations and you can compute the <em>critical path</em>: the shortest time the build could possibly
          take with unlimited hardware. That's the number to care about. A shorter critical path doesn't always make today's build faster,
          but it decides whether the build <em>scales</em>, because no amount of cores can beat it. The whole talk is variations on one move:
          find a dependency edge on the critical path and break it.
        </>
      ),
    },
    { type: "figure", render: CriticalPathFigure },

    { type: "h2", text: "The build timeline" },
    {
      type: "p",
      content: (
        <>
          New in Xcode 14, the build log gets an assistant view that plots what actually happened: the build timeline. Where the log is
          organised by hierarchy (targets, then their tasks), the timeline is organised by parallelization. Rows are tasks running at the
          same time, width is how long each one took, colour tells you which target it belonged to. Empty space is the interesting part:
          it's where unfinished tasks blocked their downstream from starting. One caution from Ben — the height of the graph is task
          concurrency, not CPU or memory utilisation.
        </>
      ),
    },
    { type: "figure", render: TimelineFigure },
    {
      type: "p",
      content: (
        <>
          The demo walks the swift-docc package. A few details worth keeping: the scheme editor's build tab lists every target in the scheme,
          whether added explicitly or dragged in as a dependency of one that was. The build log's <C>All</C> filter includes tasks from
          earlier builds that were skipped this time; <C>Recent</C> shows only what actually ran, which on an incremental build makes
          long-running surprises easy to spot. Selection is synced both ways between log and timeline, so you can click a wide bar and see
          exactly which files that compiler invocation covered, along with its full command line. Hold Option and drag a region to zoom the
          viewport to it; Option-scroll zooms back out.
        </>
      ),
    },
    {
      type: "callout",
      color: T.teal,
      label: "what good looks like",
      content: (
        <>
          A healthy timeline is vertically filled, with as little empty space as possible. Gaps mean the machine had capacity and the graph
          had nothing ready to run. Everything from here on is about closing those gaps.
        </>
      ),
    },

    // ————— 02 · Inside one target —————
    { type: "kicker", text: "02 · Ben · parallelism inside a single target" },
    { type: "h2", text: "Build phases aren't as sequential as they look" },
    {
      type: "p",
      content: (
        <>
          A target's build phases describe its work: sources to compile, headers and resources to copy, libraries to link, scripts to run.
          They're listed in the project editor in an order, but the build system doesn't just run them top to bottom. It looks at each
          phase's inputs and outputs and overlaps whatever it can prove independent. Compilation and resource copying run in parallel because
          neither consumes the other's output. Linking still follows compilation, because it eats the object files compilation produces.
        </>
      ),
    },
    { type: "h3", text: "Script phases are the exception" },
    {
      type: "p",
      content: (
        <>
          Run Script phases are the one place Xcode can't see the inputs and outputs for itself. You declare them by hand in the target
          editor, and Xcode has no way to know whether you told the truth. So its default is defensive: consecutive script phases run one at
          a time, in order, to avoid introducing a data race into the build. If your scripts are set to run based on dependency analysis and
          their input/output lists are complete, you can set <C>FUSE_BUILD_SCRIPT_PHASES</C> to <C>YES</C> and the build system will try to
          run them in parallel too. The catch is in "complete": once fused, the declared lists are all it has, and a missing entry is a data
          race that's genuinely hard to debug.
        </>
      ),
    },
    { type: "figure", render: ScriptRaceFigure },
    { type: "h3", text: "Sandboxed shell scripts" },
    {
      type: "p",
      content: (
        <>
          This is what user script sandboxing is for. Opt in with <C>ENABLE_USER_SCRIPT_SANDBOXING = YES</C> (build settings editor or an
          xcconfig) and every script phase runs inside a sandbox that blocks reads and writes anywhere in the project's source root or
          derived data, unless the path is declared as an input or output of that phase. A violation makes the script exit non-zero, which
          fails the build, and Xcode lists every path the script touched without declaring. In the checksum example above, the sandbox stops
          "Generate HTML" the moment it reaches for the undeclared <C>checksum.txt</C>, and the error message tells you which input to add.
          Fix the declaration and Xcode now sees the edge, runs the two scripts in the right order, and still parallelizes anything genuinely
          unrelated.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          The payoff is bigger than catching races. Correct dependency information means the build system can trust script phases enough to
          skip them on incremental builds when inputs haven't changed and outputs are still valid, instead of re-running them every time.
          And combined with <C>FUSE_BUILD_SCRIPT_PHASES</C>, scripts with sandbox-verified edges can run in parallel and come off the
          critical path.
        </>
      ),
    },
    {
      type: "callout",
      color: T.yellow,
      label: "not a security feature",
      content: (
        <>
          The sandbox only guards the source root and derived data. It won't stop a script touching anything else on disk. It exists to
          surface missing dependency declarations, not to contain hostile code — Ben says this outright.
        </>
      ),
    },

    // ————— 03 · Across many targets —————
    { type: "kicker", text: "03 · Artem · parallelism across targets" },
    { type: "h2", text: "A sea of tasks, and one special kind" },
    {
      type: "p",
      content: (
        <>
          A real project is a hierarchy — an app on top of local libraries split along semantic boundaries, on top of frameworks — but the
          build system flattens all of it into one big pool of tasks corresponding to every build phase of every target. One kind of task
          gets special treatment: compiling a Swift target. That's a whole sub-project of build planning, compilation and linking on its own,
          and coordinating it is delegated to a dedicated tool in the toolchain, the Swift Driver.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          Every target containing Swift code is also a module, and the binary module file capturing its public interface is a build product
          in its own right. It's the thing downstream targets need before they can start compiling against you. Keep that in mind; both of
          Xcode 14's tricks below work by producing it earlier.
        </>
      ),
    },
    { type: "h3", text: "How the driver builds one target" },
    {
      type: "p",
      content: (
        <>
          In release builds the driver schedules a single compile task covering all the target's source files, to give the optimiser the
          widest view; that one task also produces the module. In debug builds it goes the other way: compilation is broken into smaller
          sub-tasks that run in parallel and can be skipped individually on incremental builds, with a separate step to merge the partial
          products into the module. If the file count is high, the heuristics group files into batch compilation sub-tasks; the build log
          shows which files landed in which batch, each with its own diagnostics entry. Make sure Debug uses the incremental compilation
          mode setting — per-file parallelism is what keeps iteration fast.
        </>
      ),
    },
    { type: "h2", text: "Xcode 14: one scheduler instead of islands" },
    {
      type: "p",
      content: (
        <>
          Before Xcode 14 there was a boundary here. The build system scheduled its tasks, and each target's driver instance scheduled its
          own compiler sub-tasks, independently, each doing its best with the machine it could see. Artem calls the result islands of
          sub-tasks outside the build system's view, and the failure mode is easy to picture: everyone politely trying not to oversubscribe
          the CPU, nobody able to coordinate. The new Swift Driver — rewritten in Swift — is fully integrated, so the build system is now
          the central scheduler for everything, handing tasks to a fixed set of execution slots (eight, on an 8-core machine) as their
          dependencies resolve. One scheduler can see the whole machine, so it can keep it busy without oversubscribing it.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          Central scheduling exposes the real enemy on big machines: idle slots. The more cores you have, the more likely that every
          outstanding task is still waiting on inputs from tasks in flight. Two changes in Xcode 14 attack exactly that.
        </>
      ),
    },
    { type: "h3", text: "emit-module: unblock dependents early" },
    {
      type: "p",
      content: (
        <>
          New in Xcode 14 and Swift 5.7, building a target's module is a separate <C>emit-module</C> task that works directly from all the
          source files, instead of being assembled by merging every compile sub-task's partial output. The consequence: the moment
          emit-module finishes, downstream targets have the module they were waiting for and start compiling, while the rest of the
          target's compile tasks are still running. Same total work, much less time spent with idle cores staring at an unfinished
          dependency.
        </>
      ),
    },
    { type: "figure", render: EmitModuleFigure },
    { type: "h3", text: "Eager linking" },
    {
      type: "p",
      content: (
        <>
          The same idea applied to linking. If target B links target A, B's link task normally needs A's finished linked product, so the two
          link tasks sit in sequence on the critical path. With eager linking, B's link task depends on A's emit-module task instead, which
          also emits a text-based dynamic library stub: a list of the symbols the real product will end up containing. Linking against the
          promise instead of the product lets link A and link B run at the same time. It applies to pure Swift targets that are dynamically
          linked by their dependents, and it's switched on with the <C>EAGER_LINKING</C> build setting.
        </>
      ),
    },
    { type: "figure", render: EagerLinkingFigure },

    // ————— 04 · Takeaways —————
    { type: "kicker", text: "04 · closing" },
    { type: "h2", text: "What to actually do" },
    {
      type: "list",
      items: [
        <>
          Open the build timeline on your own project and look for the gaps. Every gap is a dependency edge worth questioning.
        </>,
        <>
          Declare complete inputs and outputs on every script phase, turn on <C>ENABLE_USER_SCRIPT_SANDBOXING</C> to prove the lists are
          right, then let <C>FUSE_BUILD_SCRIPT_PHASES</C> pull scripts off the critical path.
        </>,
        <>Keep Debug on incremental compilation mode so Swift targets parallelize per file.</>,
        <>
          Treat project structure as a build-performance input. Modularisation, the shape of the dependency graph and the number of build
          phases decide how much of your hardware Xcode can actually use.
        </>,
      ],
    },
    {
      type: "p",
      content: (
        <>
          The tools behind most of this are developed in the open — the{" "}
          <A href="https://github.com/swiftlang/swift-driver">Swift Driver is on GitHub</A>, in Swift, and is surprisingly readable. The
          session also points at a companion talk,{" "}
          <A href="https://developer.apple.com/videos/play/wwdc2022/110362/">Link fast: Improve build and launch times</A>, on how Xcode 14's
          linker got up to twice as fast; that one's a natural follow-up to the linker half of the 2018 session.
        </>
      ),
    },
  ],
};
