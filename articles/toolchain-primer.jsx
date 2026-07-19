import { T } from "../theme.js";
import { C, PageLink, Figure, Node, Arrow, ArrowMarker } from "../article.jsx";

// ————————————————————————————————————————————————
// Foundational primer: the vocabulary the WWDC18-415
// write-up assumes. For readers who never lived through
// C or Objective-C.
// ————————————————————————————————————————————————

// ————————————————————————————————————————————————
// Diagrams
// ————————————————————————————————————————————————
function CompileLinkFigure() {
  return (
    <Figure
      minWidth={560}
      caption="One object file per source file; the linker ties them into an executable at the end. Compiler errors happen on the left half of this picture. 'Undefined symbol' errors happen on the right."
    >
      <svg viewBox="0 0 640 200" style={{ width: "100%", display: "block" }} role="img" aria-label="Compile then link pipeline">
        <ArrowMarker id="prA" />
        <Node x={16} y={24} w={120} label="Cat.m" />
        <Node x={16} y={120} w={120} label="Dog.m" />
        <Arrow from={[140, 41]} to={[252, 41]} marker="prA" />
        <text x={196} y={33} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>compiler</text>
        <Arrow from={[140, 137]} to={[252, 137]} marker="prA" />
        <text x={196} y={129} textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.dim}>compiler</text>
        <Node x={256} y={24} w={120} label="Cat.o" color={T.yellow} />
        <Node x={256} y={120} w={120} label="Dog.o" color={T.yellow} />
        <Arrow from={[380, 41]} to={[456, 80]} marker="prA" />
        <Arrow from={[380, 137]} to={[456, 98]} marker="prA" />
        <Node x={460} y={72} w={56} label="ld" color={T.teal} />
        <Arrow from={[520, 89]} to={[548, 89]} marker="prA" />
        <Node x={552} y={72} w={72} label="MyApp" sub="executable" h={38} color={T.green} />
      </svg>
    </Figure>
  );
}

function SymbolsFigure() {
  return (
    <Figure
      minWidth={560}
      caption="Cat.o calls playSound but doesn't contain it; Dog.o defines it. The linker matches every undefined reference to a definition. When nothing defines a symbol, the build ends with 'Undefined symbols for architecture arm64'."
    >
      <svg viewBox="0 0 640 240" style={{ width: "100%", display: "block" }} role="img" aria-label="Symbol resolution at link time">
        <ArrowMarker id="prB" />
        <rect x={16} y={24} width={200} height={72} rx={8} fill={T.panelRaised} stroke={T.border} />
        <text x={32} y={48} fontFamily={T.mono} fontSize="11.5" fill={T.yellow}>Cat.o</text>
        <text x={32} y={68} fontFamily={T.mono} fontSize="10.5" fill={T.text}>-[Cat purr]   defined</text>
        <text x={32} y={84} fontFamily={T.mono} fontSize="10.5" fill={T.red}>_playSound    undefined?</text>

        <rect x={16} y={144} width={200} height={56} rx={8} fill={T.panelRaised} stroke={T.border} />
        <text x={32} y={168} fontFamily={T.mono} fontSize="11.5" fill={T.yellow}>Dog.o</text>
        <text x={32} y={188} fontFamily={T.mono} fontSize="10.5" fill={T.green}>_playSound    defined</text>

        <Arrow from={[220, 60]} to={[296, 104]} marker="prB" />
        <Arrow from={[220, 172]} to={[296, 128]} marker="prB" />
        <Node x={300} y={96} w={64} h={40} label="ld" color={T.teal} />
        <Arrow from={[368, 116]} to={[436, 116]} marker="prB" />

        <rect x={440} y={72} width={184} height={92} rx={8} fill={T.panelRaised} stroke={T.border} />
        <text x={456} y={96} fontFamily={T.mono} fontSize="11.5" fill={T.green}>MyApp</text>
        <text x={456} y={116} fontFamily={T.mono} fontSize="10.5" fill={T.text}>-[Cat purr]</text>
        <text x={456} y={132} fontFamily={T.mono} fontSize="10.5" fill={T.text}>_playSound</text>
        <text x={456} y={150} fontFamily={T.mono} fontSize="9.5" fill={T.dim}>every reference resolved</text>
      </svg>
    </Figure>
  );
}

// ————————————————————————————————————————————————
// The article
// ————————————————————————————————————————————————
export default {
  id: "toolchain-primer",
  breadcrumb: "toolchain-primer.article",
  eyebrow: "primer · read before the session 415 write-up",
  title: "The Toolchain, From Scratch",
  lede: (
    <>
      The session 415 write-up assumes you've spent time with C or Objective-C. If you haven't, and words like header, symbol and static
      library are things you nod along to, read this first. It's the vocabulary everything else is built on, and none of it is as complicated
      as it sounds. Ten minutes, no Xcode required.
    </>
  ),
  blocks: [
    // ————— 01 · Compiling —————
    { type: "kicker", text: "01 · from text to running code" },
    { type: "h2", text: "What compiling actually is" },
    {
      type: "p",
      content: (
        <>
          Your CPU can't run Swift. It runs machine code: numeric instructions baked into the silicon, each one tiny. Load this value. Add
          these two registers. Jump to that address. Everything you like about your source code (names, types, structure) exists for you, not
          the machine, and it's gone by the time anything executes. A compiler is the translator that gets you from one to the other.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          It doesn't translate your whole app in one go. The compiler works on one source file at a time, and each file's translation is
          written out as an object file: <C>Cat.m</C> in, <C>Cat.o</C> out. An object file is real machine code, but it isn't runnable,
          because compiling files in isolation leaves loose ends. <C>Cat.o</C> calls things that live in other files, and the compiler had no
          way of knowing where those things will end up.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          Tying the loose ends is a separate program's job: the linker. It takes every object file, matches each "I need this" against
          someone's "I have this", and writes the single executable that ships in your app bundle. The split matters for two everyday
          reasons. It's what makes incremental builds possible: change one file, recompile one file, relink. And it's why build errors come in
          two flavours — the compiler catches mistakes inside a file straight away, while a missing implementation only surfaces at the very
          end, from the linker.
        </>
      ),
    },
    { type: "figure", render: CompileLinkFigure },

    // ————— 02 · The C family —————
    { type: "kicker", text: "02 · the C family" },
    { type: "h2", text: "Why everything smells of C" },
    {
      type: "p",
      content: (
        <>
          Apple's platforms grew out of NeXT, and NeXT was built in the late eighties on C and Objective-C. The system frameworks you call
          every day (Foundation, UIKit) are still substantially Objective-C underneath, and Swift was designed to talk to them directly. So
          although you may never write a line of it, the machinery that builds your app still speaks C fluently, and a talk about the build
          process spends a lot of its time on C-era ideas.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          Objective-C itself, in one paragraph: it's C with a messaging layer on top. <C>[cat purr]</C> means "send the message purr to the
          object cat" — the square brackets that scare everyone are just a method call. Code is split across two files by convention: a{" "}
          <C>.h</C> header holding the public interface, and a <C>.m</C> file holding the implementation. A <C>.mm</C> file is Objective-C++,
          which allows C++ in the same file; that's why the write-up's example, <C>cat.mm</C>, ends up calling a C++ function.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          When the write-up says "the C family", it means C, C++ and Objective-C together: different languages sharing one compilation model
          and one compiler, Clang.
        </>
      ),
    },

    // ————— 03 · Headers —————
    { type: "kicker", text: "03 · headers and the preprocessor" },
    { type: "h2", text: "Declarations, definitions and a lot of copy-paste" },
    {
      type: "p",
      content: (
        <>
          Here's the puzzle headers solve. The compiler processes <C>Cat.m</C> in complete isolation; it has never seen <C>Dog.m</C> and never
          will. But <C>Cat.m</C> calls a function that lives in <C>Dog.m</C>. How can the compiler check the call is correct? The answer is to
          split everything into two parts: a declaration, which is the name and shape ("there is a function playSound that takes a string"),
          and a definition, which is the actual body. To check your code, the compiler only needs the declaration. The body can stay wherever
          it is.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          A header file is nothing more than a file full of declarations. And <C>#import</C> is nothing more than copy-paste: before
          compilation proper, a pass called the preprocessor replaces every <C>#import</C> line with the entire text of the named file. No
          lookup, no magic — the header's text is literally pasted into yours. (<C>#import</C> is Objective-C's version of C's{" "}
          <C>#include</C>; the only difference is that it won't paste the same file twice.)
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          The preprocessor has one other trick: macros. <C>#define DEBUG 1</C> is a textual find-and-replace applied before the compiler sees
          anything, and it's what powers conditional compilation like <C>#if DEBUG</C>. Keep it in the back of your mind, because macros can
          change what a pasted header means, and that's exactly what makes header caching hard — the problem Clang modules exist to solve in
          the write-up.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          The catch with copy-paste is scale. Headers include other headers, which include others. Import one Foundation header and the
          preprocessor drags in hundreds of files, and the write-up puts a number on it: over nine megabytes of text, for every single file
          you compile. That's the problem half of session 415 is about.
        </>
      ),
    },

    // ————— 04 · Symbols and libraries —————
    { type: "kicker", text: "04 · symbols and libraries" },
    { type: "h2", text: "How the linker finds anything" },
    {
      type: "p",
      content: (
        <>
          The linker's currency is the symbol: a name attached to a chunk of compiled code or data. When <C>Dog.m</C> defines playSound,{" "}
          <C>Dog.o</C> contains that function's machine code with a label on it: <C>_playSound</C>. When <C>Cat.m</C> calls it, <C>Cat.o</C>{" "}
          contains a call to <C>_playSound</C> with a note attached: undefined, someone else has this. The linker's whole job is matching
          notes to labels across every file it's given.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          This is also the anatomy of iOS development's most famous error. "Undefined symbols for architecture arm64" means the compiler was
          satisfied, because a header declared the thing — but when the linker went looking, no object file actually defined it. A header is a
          promise. This is what a broken one looks like.
        </>
      ),
    },
    { type: "figure", render: SymbolsFigure },
    {
      type: "p",
      content: (
        <>
          You don't compile Foundation from source on every build, so where does its code come from? Libraries: compiled code, packaged for
          reuse. They come in two kinds, and the difference matters enough that a third of the write-up is about it. A static library
          (<C>.a</C>) is an archive of object files that gets copied into your executable at link time; the code becomes part of your binary.
          A dynamic library (a dylib) stays a separate file, and the linker only records "this app needs libSystem" — the connection is made
          at launch. A framework is the folder Apple wraps around a dynamic library, bundling it with its headers and resources.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          The launch-time connecting is done by dyld, the dynamic linker, which loads every framework your app needs and fixes up the
          pointers before your <C>main()</C> ever runs. One small economy measure worth knowing about: the SDK on your Mac doesn't contain
          the real system dylibs, just text files listing their symbols, called TBDs. The linker only ever needed the names. The actual code
          is on the device.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          One last format to name: Mach-O. It's the file format of everything compiled on Apple platforms (executables, dylibs and object
          files alike), organised into segments: <C>__TEXT</C> for code, <C>__DATA</C> for global variables, <C>__LINKEDIT</C> for the notes
          dyld reads at launch. When the write-up walks through building one, those names are all it's walking through.
        </>
      ),
    },

    // ————— 05 · Xcode vocabulary —————
    { type: "kicker", text: "05 · the Xcode layer" },
    { type: "h2", text: "Projects, targets, schemes and phases" },
    {
      type: "p",
      content: (
        <>
          The last vocabulary set is Xcode's own. A target is one buildable thing — an app, a framework, a test bundle — together with the
          recipe for building it. A project holds your targets, files and settings. A workspace holds projects.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          Each target's recipe is a list of build phases: compile sources, link binary with libraries, copy bundle resources, in order. A run
          script phase is your own shell script wedged into that list; the write-up has strong opinions about telling the build system what
          your scripts read and write.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          Build settings are the giant wall of knobs on a target, and most of them end up as compiler or linker flags. A scheme is the thing
          in the toolbar dropdown: it says which targets to build and how to run, test and profile them.
        </>
      ),
    },
    {
      type: "p",
      content: (
        <>
          And the build system is the coordinator above all of it: the part of Xcode that turns your project into thousands of tool
          invocations (<C>clang</C>, <C>ld</C>, <C>actool</C>…) in the right order. That's the exact point where session 415 picks up. You're
          ready for it.
        </>
      ),
    },

    // ————— Glossary —————
    { type: "kicker", text: "glossary" },
    { type: "h2", text: "The terms, in one place" },
    {
      type: "p",
      content: <>Short definitions to keep beside the write-up. Ordered alphabetically, not by importance.</>,
    },
    {
      type: "glossary",
      items: [
        { term: "assembly", def: "Machine code written out in human-readable mnemonics, one line per instruction. The cat.o listing in the write-up is assembly." },
        { term: "bridging header", def: "A header in an app target listing the Objective-C headers you want callable from Swift." },
        { term: "Clang", def: "Apple's compiler for the C family. The Swift compiler also embeds it as a library, which is how Swift reads Objective-C headers." },
        { term: "compiler", def: "A program that translates source code into machine code, one file at a time." },
        { term: "declaration", def: "The name and shape of a function or type, without its body. Enough for the compiler to check your calls." },
        { term: "dyld", def: "The dynamic linker. Loads your app's frameworks at launch and fixes up pointers before main() runs." },
        { term: "dylib (dynamic library)", def: "A compiled library that stays a separate file and is connected to your app at launch rather than copied in." },
        { term: "framework", def: "A folder bundling a dynamic library with its headers and resources. How Apple ships almost everything." },
        { term: "header (.h)", def: "A file of declarations, textually pasted into any file that imports it." },
        { term: "linker (ld)", def: "The program that merges object files and libraries into one executable, resolving every symbol reference." },
        { term: "Mach-O", def: "The file format of compiled code on Apple platforms: executables, dylibs and object files." },
        { term: "macro (#define)", def: "A preprocessor find-and-replace applied before compilation. Powers #if conditional compilation." },
        { term: "mangling", def: "Encoding extra information (argument types, module name) into a symbol's name. Why C++ and Swift symbols look like line noise." },
        { term: "module", def: "A framework's headers parsed once and cached for reuse, instead of re-pasted into every file. In Swift, the unit you import." },
        { term: "module map", def: "A small file declaring which headers make up a module and which one is the umbrella." },
        { term: "NSObject / @objc", def: "NSObject is the root class of Objective-C objects. @objc marks Swift declarations as visible to Objective-C." },
        { term: "object file (.o)", def: "One source file's compiled output: real machine code, with loose ends where it references other files." },
        { term: "preprocessor", def: "The textual pass before compilation that handles #import, #include and #define." },
        { term: "run script phase", def: "Your own shell script as a step in a target's build." },
        { term: "scheme", def: "The recipe in Xcode's toolbar dropdown: which targets to build, and how to run, test and profile them." },
        { term: "SDK", def: "The headers and symbol stubs for a platform's frameworks. What your code compiles and links against." },
        { term: "static library (.a)", def: "An archive of object files copied into your executable at link time." },
        { term: ".swiftmodule", def: "A binary summary of everything a Swift target declares. Swift's replacement for headers." },
        { term: "symbol", def: "A name attached to a chunk of compiled code or data. The linker's unit of currency." },
        { term: "target", def: "One buildable product plus the instructions for building it." },
        { term: "TBD", def: "A text stub of a dylib: symbol names with the code deleted. Keeps the SDK small." },
        { term: "umbrella header", def: "A framework's main header, which imports all its public headers. Foundation.h is one." },
        { term: "weak symbol", def: "A symbol allowed to be missing at runtime. All @available API markup compiles down to this." },
      ],
    },
    {
      type: "p",
      content: (
        <>
          That's the grounding. Now go read{" "}
          <PageLink href="#/wwdc2018-415">Behind the Scenes of the Xcode Build Process</PageLink> — it should feel a lot less like
          eavesdropping on someone else's conversation.
        </>
      ),
    },
  ],
};
