import { C, PageLink } from "../components/article.jsx";
import { Cmd } from "../components/lab.jsx";

// ————————————————————————————————————————————————
// Lab 01: play the role of the build system by hand.
// Compile, inspect and link a two-file Swift module in the
// embedded terminal; checkpoints tick off from real output.
// ————————————————————————————————————————————————
export default {
  id: "be-the-build-system",
  breadcrumb: "labs/be-the-build-system.zsh",
  eyebrow: "lab 01 · a terminal, three commands deep into ⌘B",
  title: "Be the Build System",
  lede: (
    <>
      Xcode runs thousands of tasks when you press ⌘B. In this lab you run about six of them yourself: compile a two-file Swift module to
      object files, read the symbol table, link an executable, then break the link on purpose and read the error like the linker does. The
      terminal below is a real shell on your Mac; the checkpoints watch its output and tick themselves off as you go.
    </>
  ),
  intro: [
    {
      type: "p",
      content: (
        <>
          You'll need the Swift toolchain (Xcode or the Command Line Tools) and the lab bridge running: <C>npm run lab</C> from the repo.
          Everything happens in a scratch folder in your home directory, and nothing here touches Xcode itself. If a checkpoint doesn't
          notice something you clearly did, use its "mark done" button; the watcher is a regex, not a grader.
        </>
      ),
    },
  ],
  steps: [
    {
      id: "toolchain",
      title: "Prove there's a toolchain",
      body: (
        <>
          <Cmd>swift --version</Cmd>
          Whatever this prints is the compiler every build on this machine goes through. Note the version — symbol output can shift between
          releases.
        </>
      ),
      watch: { pattern: /Swift version \d/, label: "swift --version output" },
    },
    {
      id: "sources",
      title: "Lay out the source files",
      body: (
        <>
          Two files, one type each. <C>main.swift</C> uses <C>Point</C>, but nothing in the file says where Point lives — the compiler has to
          find it. Paste the whole block:
          <Cmd title="creates ~/buildlab with two files, then lists them">
{`mkdir -p ~/buildlab && cd ~/buildlab

cat > Point.swift <<'EOF'
struct Point {
    var x: Double
    var y: Double

    func distance(to other: Point) -> Double {
        let dx = x - other.x
        let dy = y - other.y
        return (dx * dx + dy * dy).squareRoot()
    }
}
EOF

cat > main.swift <<'EOF'
let a = Point(x: 0, y: 0)
let b = Point(x: 3, y: 4)
print("distance:", a.distance(to: b))
EOF

ls`}
          </Cmd>
        </>
      ),
      watch: { pattern: /(Point\.swift\s+main\.swift|main\.swift\s+Point\.swift)/, label: "ls showing both .swift files" },
    },
    {
      id: "objects",
      title: "Compile to object files",
      body: (
        <>
          This is the compile half of the 2018 session's task graph. Passing both files in one invocation makes them one module, which is how
          <C>main.swift</C> is allowed to see <C>Point</C> — the compiler parses the other file to find the declaration, exactly the
          cross-file bookkeeping the WWDC18 talk describes.
          <Cmd>{`swiftc -c Point.swift main.swift
ls *.o`}</Cmd>
          One object file per source file. These are the intermediate products the build system tracks as nodes in its graph.
        </>
      ),
      watch: { pattern: /(Point\.o\s+main\.o|main\.o\s+Point\.o)/, label: "ls showing both .o files" },
    },
    {
      id: "symbols",
      title: "Find the promises in the symbol table",
      body: (
        <>
          <C>main.o</C> compiled fine, but it can't run: it calls code it doesn't contain. <C>nm -u</C> lists its undefined symbols — every{" "}
          <C>U</C> line is an IOU addressed to some other object file. The names are mangled, so pipe them through the demangler to see them
          in Swift terms.
          <Cmd>{`nm -u main.o
nm -u main.o | swift demangle`}</Cmd>
          Somewhere in there is Point's initialiser and <C>distance(to:)</C>. This is what "symbol" means every time the primer and the
          linker session use the word.
        </>
      ),
      watch: { pattern: /Point\.distance\(to:/, label: "a demangled Point.distance(to:) symbol" },
    },
    {
      id: "link",
      title: "Link and run it",
      body: (
        <>
          The linker's whole job: combine the object files, match every U in one against a definition in another.
          <Cmd>{`swiftc Point.o main.o -o pointapp
./pointapp`}</Cmd>
          A 3-4-5 triangle, so the output should be exactly 5.0. You just did, by hand and in order, what the build system schedules from its
          dependency graph.
        </>
      ),
      watch: { pattern: /distance:\s*5(\.0)?/, label: "the program printing distance: 5.0" },
    },
    {
      id: "break",
      title: "Break the graph on purpose",
      body: (
        <>
          Now link without <C>Point.o</C> and leave the IOUs unpaid:
          <Cmd>{`swiftc main.o -o pointapp`}</Cmd>
          Read the error properly — it names the missing symbols in mangled form. Next time Xcode shows you an "Undefined symbols" build
          failure, it's this exact situation: some object file or library didn't make it to the link line.
        </>
      ),
      watch: { pattern: /ndefined symbol/, label: "the linker's undefined-symbols error" },
    },
  ],
  outro: [
    {
      type: "h2",
      text: "What the build system does with all this" },
    {
      type: "p",
      content: (
        <>
          Everything you just typed by hand, in the order you had to type it, is the dependency graph from{" "}
          <PageLink href="#/wwdc2018-415">the 2018 session</PageLink>: sources feed compile tasks, object files feed the link task, and the
          order isn't a convention, it's forced by what each task consumes. Run <C>touch Point.swift</C> and ask yourself which of your
          commands genuinely need re-running — that judgement, made by hashing task signatures, is the entire incremental build. And the
          scheduling question (which of your commands could have run at the same time?) is the whole subject of{" "}
          <PageLink href="#/wwdc2022-110364">the parallelization session</PageLink>.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          Cleanup, if you want it: <C>rm -rf ~/buildlab</C>.
        </>
      ),
    },
  ],
};
