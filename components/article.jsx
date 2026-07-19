import { T } from "../theme.js";

// ————————————————————————————————————————————————
// Generic article page. All presentation lives here;
// content comes in as an article object (see articles/).
//
// Article shape:
//   { id, breadcrumb, eyebrow, title, lede, blocks: [...] }
// Block types:
//   { type: "kicker" | "h2" | "h3", text }
//   { type: "p", content }            — JSX
//   { type: "code", title, code }
//   { type: "callout", color, label, content }
//   { type: "list", items }           — array of JSX
//   { type: "figure", render }        — component using Figure/Node/Arrow
// ————————————————————————————————————————————————

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

export function C({ children }) {
  return (
    <code style={{ fontFamily: T.mono, fontSize: "0.86em", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 4, padding: "1px 5px" }}>
      {children}
    </code>
  );
}

export function A({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: T.teal, textDecoration: "none", borderBottom: `1px solid ${T.teal}55` }}>
      {children}
    </a>
  );
}

// Internal navigation between pages — same look as A, no new tab.
export function PageLink({ href, children }) {
  return (
    <a href={href} style={{ color: T.teal, textDecoration: "none", borderBottom: `1px solid ${T.teal}55` }}>
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

function Glossary({ items }) {
  return (
    <dl style={{ margin: "0 0 16px", display: "grid", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px" }}>
          <dt style={{ fontFamily: T.mono, fontSize: 13, color: T.teal, marginBottom: 3 }}>{item.term}</dt>
          <dd style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.text }}>{item.def}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Figure({ caption, minWidth, children }) {
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
export function Node({ x, y, w, h = 34, label, sub, color = T.text }) {
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

export function Arrow({ from, to, marker, dashed }) {
  return (
    <line
      x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
      stroke={T.dim} strokeWidth="1.2"
      strokeDasharray={dashed ? "4 4" : undefined}
      markerEnd={`url(#${marker})`}
    />
  );
}

export function ArrowMarker({ id }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill={T.dim} />
      </marker>
    </defs>
  );
}

// ————————————————————————————————————————————————
// Block renderer + page
// ————————————————————————————————————————————————
function renderBlock(block, i) {
  switch (block.type) {
    case "kicker":
      return <Kicker key={i}>{block.text}</Kicker>;
    case "h2":
      return <H2 key={i}>{block.text}</H2>;
    case "h3":
      return <H3 key={i}>{block.text}</H3>;
    case "p":
      return <P key={i}>{block.content}</P>;
    case "code":
      return <CodeBlock key={i} title={block.title}>{block.code}</CodeBlock>;
    case "callout":
      return <Callout key={i} color={block.color} label={block.label}>{block.content}</Callout>;
    case "list":
      return <UL key={i} items={block.items} />;
    case "glossary":
      return <Glossary key={i} items={block.items} />;
    case "figure": {
      const Diagram = block.render;
      return <Diagram key={i} />;
    }
    default:
      return null;
  }
}

export default function Article({ article }) {
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
            {article.breadcrumb}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "36px 16px 0" }}>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, marginBottom: 8 }}>// {article.eyebrow}</div>
        <h1 style={{ fontFamily: T.mono, fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 600, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.25 }}>
          {article.title}
        </h1>
        <p style={{ color: T.dim, fontSize: 14, margin: "14px 0 0", lineHeight: 1.6 }}>
          {article.lede}
        </p>

        {article.blocks.map(renderBlock)}

        <div style={{ marginTop: 48, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <a href="#/" style={{ fontFamily: T.mono, fontSize: 13, color: T.pink, textDecoration: "none" }}>← back to the dashboard</a>
        </div>
      </main>
    </div>
  );
}
