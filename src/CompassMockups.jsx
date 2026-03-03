import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";

// Color tokens matched to Linear's actual dark theme (from screenshots)
const c = {
  bg: "#0e0e10",
  surface: "#151518",
  surfaceRaised: "#1b1b1f",
  surfaceHover: "#202025",
  border: "#222228",
  borderSubtle: "#1c1c21",
  text: "#ededef",
  textSecondary: "#7d7d8a",
  textTertiary: "#4e4e5a",
  accent: "#6e56cf",
  accentDim: "rgba(110,86,207,0.12)",
  green: "#30a46c",
  greenDim: "rgba(48,164,108,0.08)",
  amber: "#f5a623",
  amberDim: "rgba(245,166,35,0.08)",
  red: "#e5484d",
  redDim: "rgba(229,72,77,0.08)",
  blue: "#3b82f6",
  blueDim: "rgba(59,130,246,0.08)",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

const font = {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"SF Mono", "Fira Code", Menlo, Consolas, monospace',
};

// Minimal SVG icons matching Linear's monoline style
const Icons = {
  inbox: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M2 10h3.5l1 1.5h3l1-1.5H14" />
    </svg>
  ),
  myIssues: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="8" cy="8" r="5.5" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  initiatives: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 4v4l2.5 2.5" />
    </svg>
  ),
  projects: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
      <path d="M5.5 6.5h5M5.5 9.5h3" />
    </svg>
  ),
  views: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M2 5h12M2 8h12M2 11h8" />
    </svg>
  ),
  more: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="4" cy="8" r="1" /><circle cx="8" cy="8" r="1" /><circle cx="12" cy="8" r="1" />
    </svg>
  ),
  issues: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="5" />
    </svg>
  ),
  cycles: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M12 4a6 6 0 11-2-1.5" /><path d="M12 2v2.5H9.5" />
    </svg>
  ),
  search: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13.5 13.5" />
    </svg>
  ),
  chevronRight: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3.5 2L6.5 5L3.5 8" />
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2l1.8 3.6L14 6.2l-3 2.9.7 4.2L8 11.4l-3.7 1.9.7-4.2-3-2.9 4.2-.6z" />
    </svg>
  ),
  dots: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="4" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="12" cy="8" r="1.2" />
    </svg>
  ),
  compass: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <polygon points="10.5,5.5 6.5,6.5 5.5,10.5 9.5,9.5" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  sparkle: (size = 12) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1l1.2 4.8L14 8l-4.8 1.2L8 14l-1.2-4.8L2 8l4.8-1.2z" />
    </svg>
  ),
};

// Reusable AI reasoning indicator — sparkle icon with hover tooltip
// Uses a portal so the tooltip escapes parent overflow clipping.
// Auto-flips below the icon when too close to the top of the viewport.
function ReasoningToggle({ reasoning, confidence }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, flipBelow: false });
  const ref = useRef(null);
  const tooltipWidth = 280;
  const viewportPad = 12;

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Horizontal: center on icon, then clamp so tooltip stays in viewport
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      if (left < viewportPad) left = viewportPad;
      if (left + tooltipWidth > vw - viewportPad) left = vw - viewportPad - tooltipWidth;

      // Vertical: prefer above, flip below if not enough room at top,
      // also flip below if placing above would go off-screen
      const flipBelow = rect.top < 120 || rect.top - 6 < viewportPad;
      let top;
      if (flipBelow) {
        top = rect.bottom + 6;
        // If it would go off the bottom, clamp it
        if (top + 100 > vh) top = vh - 120;
      } else {
        top = rect.top - 6;
      }

      setPos({ left, top, flipBelow });
    }
    setShow(true);
  };

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: show ? c.amber : c.textTertiary,
        padding: "2px 4px", flexShrink: 0, borderRadius: 3,
        background: show ? c.amberDim : "transparent",
        transition: "color 0.15s, background 0.15s",
      }}>
        {Icons.sparkle(16)}
      </span>
      {show && ReactDOM.createPortal(
        <div style={{
          position: "fixed",
          left: pos.left,
          top: pos.flipBelow ? pos.top : "auto",
          bottom: pos.flipBelow ? "auto" : `calc(100vh - ${pos.top}px)`,
          maxHeight: `calc(100vh - ${2 * viewportPad}px)`,
          overflowY: "auto",
          width: tooltipWidth, padding: "10px 12px", background: c.surfaceRaised, border: `1px solid ${c.border}`,
          borderRadius: 6, fontSize: 12, color: c.textSecondary, lineHeight: 1.5,
          fontFamily: font.sans,
          zIndex: 99999, pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}>
          {reasoning}
          {confidence != null && (
            <span style={{ display: "block", marginTop: 4, fontSize: 11, fontFamily: font.mono, color: c.textTertiary }}>
              Confidence: {confidence}%
            </span>
          )}
        </div>,
        document.body
      )}
    </span>
  );
}

// Hover-aware row for clickable list items
function HoverRow({ children, style, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ ...style, background: hovered ? c.surfaceHover : (style?.background || "transparent"), transition: "background 0.1s" }}
    >
      {children}
    </div>
  );
}

// Hover-aware tab
function HoverTab({ children, active, onClick, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ ...style, background: hovered && !active ? c.surfaceHover : "transparent", borderRadius: hovered && !active ? 4 : 0, transition: "background 0.1s" }}
    >
      {children}
    </span>
  );
}

// Shared sidebar component
function Sidebar({ activeItem }) {
  return (
    <div style={{ width: 220, borderRight: `1px solid ${c.border}`, minHeight: "calc(100vh - 50px)", padding: "10px 8px", background: c.bg, flexShrink: 0 }}>
      {/* Top nav items */}
      {[
        { icon: Icons.inbox, label: "Inbox" },
        { icon: Icons.myIssues, label: "My Issues" },
      ].map(item => (
        <div key={item.label} style={{ padding: "6px 10px", borderRadius: 5, fontSize: 13, color: activeItem === item.label ? c.text : c.textSecondary, background: activeItem === item.label ? c.surfaceRaised : "transparent", display: "flex", alignItems: "center", gap: 8, marginBottom: 2, cursor: "pointer" }}>
          <span style={{ color: activeItem === item.label ? c.text : c.textTertiary, display: "flex" }}>{item.icon}</span>
          {item.label}
        </div>
      ))}

      {/* Workspace section */}
      <div style={{ margin: "16px 10px 8px", fontSize: 11, fontWeight: 500, color: c.textTertiary, display: "flex", alignItems: "center", gap: 4 }}>
        Workspace
        <span style={{ color: c.textTertiary, marginLeft: 1, fontSize: 9 }}>▾</span>
      </div>
      {[
        { icon: Icons.initiatives, label: "Initiatives" },
        { icon: Icons.projects, label: "Projects" },
        { icon: Icons.views, label: "Views" },
        { icon: Icons.more, label: "More" },
      ].map(item => (
        <div key={item.label} style={{ padding: "6px 10px", borderRadius: 5, fontSize: 13, color: activeItem === item.label ? c.text : c.textSecondary, background: activeItem === item.label ? c.surfaceRaised : "transparent", display: "flex", alignItems: "center", gap: 8, marginBottom: 2, cursor: "pointer" }}>
          <span style={{ color: activeItem === item.label ? c.text : c.textTertiary, display: "flex" }}>{item.icon}</span>
          {item.label === "More" ? <span style={{ fontSize: 12 }}>···</span> : item.label}
        </div>
      ))}

      {/* Teams */}
      <div style={{ margin: "16px 10px 8px", fontSize: 11, fontWeight: 500, color: c.textTertiary, display: "flex", alignItems: "center", gap: 4 }}>
        Your teams
        <span style={{ color: c.textTertiary, marginLeft: 1, fontSize: 9 }}>▾</span>
      </div>
      {[
        { name: "Platform", color: c.purple, key: "PLAT" },
        { name: "Tyler's Demo", color: c.green, key: "TYL" },
      ].map(team => (
        <div key={team.name}>
          <div style={{ padding: "6px 10px", borderRadius: 5, fontSize: 13, color: c.textSecondary, display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: team.color, flexShrink: 0 }} />
            {team.name}
            <span style={{ color: c.textTertiary, marginLeft: 1, fontSize: 9 }}>▾</span>
          </div>
          {["Issues", "Cycles", "Projects", "Views"].map(sub => (
            <div key={sub} style={{ padding: "5px 10px 5px 32px", fontSize: 13, color: c.textTertiary, cursor: "pointer" }}>
              {sub}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Top bar
function TopBar({ children, right }) {
  return (
    <div style={{ height: 50, borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", fontSize: 13, color: c.textSecondary, background: c.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{children}</div>
      {right && <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{right}</div>}
    </div>
  );
}

// ============================================
// MOCKUP 1: Initiatives List with Emerging Theme
// ============================================
function InitiativesList() {
  const [themeDismissed, setThemeDismissed] = useState(false);

  const initiatives = [
    { name: "Enterprise Readiness", desc: "Land our first 10 enterprise contracts. Requires: SSO/SAML, audit logging, role-based permissions, SOC2 compliance, admin dashboard. This initiative is our bridge from SMB to enterprise.", projects: "0 / 2" },
    { name: "AI-Powered Workflows", desc: "Integrate AI throughout the product to automate repetitive tasks and surface intelligent suggestions. Focus areas: smart issue triage, automated duplicate detection, AI-generated issue summaries, and natural language search.", projects: "0 / 2" },
    { name: "10x Onboarding Conversion", desc: "Our onboarding funnel converts at 12%. Industry best is 40%+. This initiative covers everything from signup flow redesign to the first-run experience, activation emails, and in-app guidance.", projects: "0 / 2" },
    { name: "Rebuild API Infrastructure", desc: "Our current API layer is a bottleneck for scaling. This initiative covers the full migration to a new API architecture — new endpoints, better auth, rate limiting, documentation.", projects: "0 / 2" },
  ];

  return (
    <div style={{ background: c.bg, minHeight: "100vh", fontFamily: font.sans, color: c.text }}>
      <TopBar>
        <span style={{ color: c.text, fontWeight: 500 }}>Tyler's Demo</span>
        <span style={{ display: "flex", color: c.textTertiary }}>{Icons.search}</span>
        <span style={{ display: "flex", color: c.amber }}>{Icons.compass}</span>
      </TopBar>

      <div style={{ display: "flex" }}>
        <Sidebar activeItem="Initiatives" />

        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {/* Page header */}
          <div style={{ padding: "24px 32px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>Initiatives</h1>
              <span style={{ fontSize: 13, color: c.accent, cursor: "pointer" }}>+ New initiative</span>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 0 }}>
              {["Active", "Planned", "Completed"].map((tab, i) => (
                <span key={tab} style={{ padding: "8px 14px", fontSize: 13, color: i === 0 ? c.text : c.textSecondary, fontWeight: i === 0 ? 500 : 400, borderBottom: i === 0 ? `2px solid ${c.text}` : "2px solid transparent", cursor: "pointer" }}>{tab}</span>
              ))}
            </div>
          </div>

          {/* Compass: Emerging Theme Banner */}
          {!themeDismissed && (
            <div style={{ margin: "18px 32px", padding: "16px 20px", background: c.surface, border: `1px solid ${c.border}`, borderRadius: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex", color: c.amber }}>{Icons.compass}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: c.amber }}>Compass</span>
                  <span style={{ width: 1, height: 12, background: c.border }} />
                  <span style={{ fontSize: 12, color: c.amber, fontWeight: 500 }}>Emerging theme detected</span>
                </div>
                <span onClick={() => setThemeDismissed(true)} style={{ color: c.textTertiary, cursor: "pointer", fontSize: 14, padding: "0 4px" }}>×</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: c.text, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  Performance at Scale
                  <ReasoningToggle reasoning="Compass detected 5 issues across 3 teams that share a common theme: handling performance degradation in workspaces with 10k+ issues. These span query optimization (PLAT-22, PLAT-21), rendering performance (PLAT-20), and data pagination (PLAT-19, TYL-11). No existing initiative covers cross-cutting performance work." confidence={84} />
                </div>
                <div style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.45 }}>
                  5 issues across <span style={{ color: c.text }}>Platform</span>, <span style={{ color: c.text }}>Product</span>, and <span style={{ color: c.text }}>Growth</span> are addressing performance degradation for large workspaces. No initiative covers this yet.
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["PLAT-22", "PLAT-21", "PLAT-20", "PLAT-19", "TYL-11"].map(id => (
                    <span key={id} style={{ fontSize: 11, fontFamily: font.mono, color: c.textSecondary, background: c.surfaceRaised, padding: "2px 6px", borderRadius: 3 }}>{id}</span>
                  ))}
                </div>
                <div>
                  <button style={{ background: c.amber, border: "none", borderRadius: 5, padding: "7px 14px", fontSize: 12, fontWeight: 500, color: "#0e0e10", cursor: "pointer", fontFamily: font.sans, whiteSpace: "nowrap" }}>
                    Create initiative
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Column headers */}
          <div style={{ display: "flex", padding: "10px 32px", borderBottom: `1px solid ${c.border}`, fontSize: 12, color: c.textTertiary }}>
            <span style={{ flex: 1, minWidth: 0 }}>Name</span>
            <span style={{ width: 90, textAlign: "center", flexShrink: 0 }}>Projects</span>
            <span style={{ width: 100, textAlign: "center", flexShrink: 0 }}>Health</span>
            <span style={{ width: 80, textAlign: "right", flexShrink: 0 }}>Owner</span>
          </div>

          {/* Initiative rows */}
          {initiatives.map((init) => (
            <HoverRow key={init.name} style={{ display: "flex", alignItems: "center", padding: "12px 32px", borderBottom: `1px solid ${c.borderSubtle}`, cursor: "pointer" }}>
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex", color: c.textTertiary, flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="5.5" /></svg>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{init.name}</span>
                </div>
                <div style={{ fontSize: 13, color: c.textTertiary, marginLeft: 24, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{init.desc}</div>
              </div>
              <span style={{ width: 90, textAlign: "center", fontSize: 13, color: c.textSecondary, flexShrink: 0 }}>
                <span style={{ color: c.green }}>⊘</span> {init.projects}
              </span>
              <span style={{ width: 100, textAlign: "center", fontSize: 12, color: c.textTertiary, flexShrink: 0 }}>
                <span style={{ opacity: 0.5 }}>○</span> No updates
              </span>
              <span style={{ width: 80, textAlign: "right", fontSize: 13, color: c.textTertiary, flexShrink: 0 }}>—</span>
            </HoverRow>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MOCKUP 2: Project Detail with Compass Tab
// ============================================
function ProjectDetail() {
  const [activeTab, setActiveTab] = useState("Compass");
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  const insights = [
    { id: 1, type: "coherence", title: "3 issues may belong to a different project", summary: "Issues focused on customer-specific fixes rather than the smart search feature this project covers",
      reasoning: "Compass compared the project scope ('build intelligent search with natural language queries, faceted filters, and ML-ranked results') against the content of each issue. Three issues describe frontend rendering bugs, one-off customer requests, and webhook debugging — none of which advance the search feature.",
      overallConfidence: 77,
      details: [
        { id: "PLAT-5", title: "Fix customer-reported dashboard loading issue", reason: "Issue describes a client-side charting performance problem. This project is about building smart search — a completely unrelated feature area.", confidence: 78 },
        { id: "PLAT-6", title: "Add custom header support per customer request", reason: "This is a one-off accommodation for a specific customer, not related to search functionality. Likely belongs in the API Infrastructure project.", confidence: 82 },
        { id: "PLAT-7", title: "Fix webhook delivery failures for customer X", reason: "Reactive support work for a single customer's webhook issues. Unrelated to the search feature this project is building.", confidence: 71 },
      ]},
    { id: 2, type: "drift", title: "Project may be drifting from original scope", summary: "Originally scoped around intelligent search with NLP and ML ranking, but recent issues focus on reactive support work",
      reasoning: "Comparing the first 2 weeks of work (search index design, NLP query parsing, ranking algorithm research) against the last 2 weeks (customer bug fixes, one-off header support, webhook debugging). The project's center of gravity has shifted from building the search feature to handling unrelated support tasks.",
      overallConfidence: 73,
      details: [] },
  ];

  const activeInsights = insights.filter(i => !dismissed.has(i.id));

  return (
    <div style={{ background: c.bg, minHeight: "100vh", fontFamily: font.sans, color: c.text }}>
      <TopBar
        right={<div style={{ display: "flex", gap: 10, color: c.textTertiary }}><span style={{ display: "flex", cursor: "pointer" }}>{Icons.star}</span><span style={{ display: "flex", cursor: "pointer" }}>{Icons.dots}</span></div>}>
        <span style={{ color: c.textSecondary }}>Projects</span>
        <span style={{ color: c.textTertiary, fontSize: 11 }}>›</span>
        <span style={{ display: "flex", color: c.textTertiary }}>{Icons.projects}</span>
        <span style={{ color: c.text, fontWeight: 500 }}>Smart Search</span>
      </TopBar>

      <div style={{ display: "flex" }}>
        <Sidebar activeItem="Projects" />

        <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
          {/* Main content area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, padding: "0 32px", borderBottom: `1px solid ${c.border}` }}>
              {["Overview", "Updates", "Issues", "Compass"].map(tab => (
                <HoverTab key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "12px 14px",
                  fontSize: 13,
                  color: activeTab === tab ? c.text : c.textSecondary,
                  fontWeight: activeTab === tab ? 500 : 400,
                  borderBottom: activeTab === tab ? `2px solid ${c.text}` : "2px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  {tab === "Compass" && <span style={{ display: "flex", color: c.amber }}>{Icons.compass}</span>}
                  {tab}
                  {tab === "Compass" && activeInsights.length > 0 && (
                    <span style={{ background: c.amberDim, color: c.amber, fontSize: 11, fontWeight: 600, padding: "0 5px", borderRadius: 100, fontFamily: font.mono, lineHeight: "18px" }}>{activeInsights.length}</span>
                  )}
                </HoverTab>
              ))}
              <span style={{ padding: "12px 10px", fontSize: 14, color: c.textTertiary, cursor: "pointer" }}>+</span>
            </div>

            {/* Compass tab content */}
            {activeTab === "Compass" && (
              <div style={{ padding: "24px 32px" }}>
                {activeInsights.map(insight => (
                  <div key={insight.id} style={{ borderBottom: `1px solid ${c.border}`, paddingBottom: insight.details.length > 0 && expandedInsight === insight.id ? 0 : 14, marginBottom: 14 }}>
                    <HoverRow onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)} style={{ display: "flex", alignItems: "flex-start", cursor: "pointer", padding: "8px 10px 10px", borderRadius: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.amber, flexShrink: 0, marginTop: 6, marginRight: 10 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: c.text, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                          {insight.title}
                          <ReasoningToggle reasoning={insight.reasoning} confidence={insight.overallConfidence} />
                        </div>
                        <div style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.4 }}>{insight.summary}</div>
                      </div>
                      <span onClick={e => { e.stopPropagation(); setDismissed(prev => new Set([...prev, insight.id])); }} style={{ color: c.textTertiary, cursor: "pointer", fontSize: 16, padding: "0 4px", marginLeft: 8, flexShrink: 0, lineHeight: 1 }}>×</span>
                    </HoverRow>

                    {expandedInsight === insight.id && insight.details.length > 0 && (
                      <div style={{ marginLeft: 17, paddingTop: 6, paddingBottom: 14 }}>
                        {insight.details.map(d => (
                          <HoverRow key={d.id} style={{ display: "flex", alignItems: "center", padding: "7px 6px", gap: 10, borderRadius: 4, cursor: "pointer" }}>
                            <span style={{ fontSize: 12, fontFamily: font.mono, color: c.textSecondary, flexShrink: 0, width: 52 }}>{d.id}</span>
                            <span style={{ fontSize: 13, color: c.text, flex: 1 }}>{d.title}</span>
                            <ReasoningToggle reasoning={d.reason} confidence={d.confidence} />
                          </HoverRow>
                        ))}
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button style={{ background: c.surfaceRaised, border: `1px solid ${c.border}`, borderRadius: 5, padding: "6px 12px", fontSize: 12, color: c.text, cursor: "pointer", fontFamily: font.sans }}>Move flagged issues</button>
                          <button style={{ background: "none", border: `1px solid ${c.border}`, borderRadius: 5, padding: "6px 12px", fontSize: 12, color: c.textSecondary, cursor: "pointer", fontFamily: font.sans }}>Dismiss</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Overview tab content */}
            {activeTab === "Overview" && (
              <div style={{ padding: "32px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ display: "flex", color: c.textTertiary }}>{Icons.projects}</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Smart Search</h2>
                <p style={{ fontSize: 13, color: c.textTertiary, margin: "0 0 16px" }}>Add a short summary...</p>

                <div style={{ display: "flex", gap: 12, fontSize: 13, color: c.textSecondary, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>Properties</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={c.amber} strokeWidth="1.5"><circle cx="6" cy="6" r="4" /></svg>
                    Backlog
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>··· No priority</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="4" r="2" /><path d="M2 10c0-2 1.8-3.2 4-3.2s4 1.2 4 3.2" /></svg>
                    Lead
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="2.5" width="10" height="7" rx="1" /><path d="M3 1v3M9 1v3" /></svg>
                    Target date
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: c.purple, display: "inline-block" }} />
                    Platform
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: c.textSecondary, marginBottom: 16 }}>
                  Initiatives
                  <span style={{ display: "flex", alignItems: "center", gap: 4, background: c.surfaceRaised, padding: "2px 8px", borderRadius: 100, fontSize: 12 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="6" r="4" /><path d="M6 3v3l2 2" /></svg>
                    AI-Powered Workflows
                  </span>
                  <span style={{ color: c.textTertiary, cursor: "pointer" }}>+</span>
                </div>

                <div style={{ fontSize: 13, color: c.textTertiary, marginBottom: 20 }}>
                  Resources <span style={{ cursor: "pointer" }}>+ Add document or link...</span>
                </div>

                <div style={{ padding: "28px 0", borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, textAlign: "center", color: c.textTertiary, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M7 2v10M2 7h10" /></svg>
                  Write first project update
                </div>

                <div style={{ marginTop: 20, fontSize: 13, color: c.textTertiary }}>
                  Description
                  <div style={{ marginTop: 6, color: c.textTertiary }}>Add a description...</div>
                </div>

                <div style={{ marginTop: 20, fontSize: 13, color: c.textTertiary }}>
                  + Milestone
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar — matches Linear's project sidebar */}
          <div style={{ width: 270, flexShrink: 0, borderLeft: `1px solid ${c.border}`, padding: "18px 18px", minHeight: "calc(100vh - 50px)", fontSize: 13 }}>
            {/* Properties */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: c.textTertiary, display: "flex", alignItems: "center", gap: 4 }}>Properties <span style={{ fontSize: 9 }}>▾</span></span>
              <span style={{ color: c.textTertiary, cursor: "pointer" }}>+</span>
            </div>

            {[
              { label: "Status", value: "Backlog", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={c.amber} strokeWidth="1.5"><circle cx="6" cy="6" r="4" /></svg> },
              { label: "Priority", value: "No priority", icon: <span style={{ color: c.textTertiary }}>···</span> },
              { label: "Lead", value: "Add lead", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="4" r="2" /><path d="M2 10c0-2 1.8-3.2 4-3.2s4 1.2 4 3.2" /></svg> },
              { label: "Members", value: "Add members", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="4" cy="4" r="2" /><circle cx="8" cy="4" r="2" /><path d="M0.5 10c0-1.5 1.5-2.5 3.5-2.5M7.5 10c0-1.5-1.5-2.5-3.5-2.5" /></svg> },
            ].map(prop => (
              <div key={prop.label} style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 8 }}>
                <span style={{ width: 80, fontSize: 12, color: c.textTertiary, flexShrink: 0 }}>{prop.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: c.textSecondary }}>
                  {prop.icon} {prop.value}
                </span>
              </div>
            ))}

            {/* Dates */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 8 }}>
              <span style={{ width: 80, fontSize: 12, color: c.textTertiary, flexShrink: 0 }}>Dates</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: c.textSecondary }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="2.5" width="10" height="7" rx="1" /><path d="M3 1v3M9 1v3" /></svg>
                Start → Target
              </span>
            </div>

            {/* Teams */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 8 }}>
              <span style={{ width: 80, fontSize: 12, color: c.textTertiary, flexShrink: 0 }}>Teams</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: c.textSecondary }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c.purple }} />
                Platform
              </span>
            </div>

            {/* Initiatives */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 8 }}>
              <span style={{ width: 80, fontSize: 12, color: c.textTertiary, flexShrink: 0 }}>Initiatives</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: c.textSecondary }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="6" r="4" /><path d="M6 3v3l2 2" /></svg>
                AI-Powered Workflows
              </span>
              <span style={{ color: c.textTertiary, cursor: "pointer" }}>+</span>
            </div>

            {/* Labels */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14, gap: 8 }}>
              <span style={{ width: 80, fontSize: 12, color: c.textTertiary, flexShrink: 0 }}>Labels</span>
              <span style={{ color: c.textTertiary, cursor: "pointer" }}>Add label</span>
            </div>

            <div style={{ borderTop: `1px solid ${c.border}`, margin: "4px 0 12px" }} />

            {/* Milestones */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: c.textTertiary, display: "flex", alignItems: "center", gap: 4 }}>Milestones <span style={{ fontSize: 9 }}>▾</span></span>
              <span style={{ color: c.textTertiary, cursor: "pointer" }}>+</span>
            </div>
            <div style={{ fontSize: 12, color: c.textTertiary, lineHeight: 1.5, marginBottom: 14 }}>
              Add milestones to organize work within your project and break it into more granular stages.
            </div>

            <div style={{ borderTop: `1px solid ${c.border}`, margin: "4px 0 12px" }} />

            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: c.textTertiary, display: "flex", alignItems: "center", gap: 4 }}>Progress <span style={{ fontSize: 9 }}>▾</span></span>
            </div>
            <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: c.textTertiary }}>Scope</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>1</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: c.textTertiary }}>Completed</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>0</div>
              </div>
            </div>

            {/* Assignees / Labels / Cycles tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 12, borderBottom: `1px solid ${c.border}` }}>
              {["Assignees", "Labels", "Cycles"].map((t, i) => (
                <span key={t} style={{ padding: "7px 10px", fontSize: 12, color: i === 0 ? c.text : c.textTertiary, borderBottom: i === 0 ? `2px solid ${c.text}` : "2px solid transparent", cursor: "pointer" }}>{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: c.textTertiary }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="4" r="2" /><path d="M2 10c0-2 1.8-3.2 4-3.2s4 1.2 4 3.2" /></svg>
              No assignee
              <span style={{ marginLeft: "auto", color: c.textSecondary }}>1</span>
            </div>

            <div style={{ borderTop: `1px solid ${c.border}`, margin: "12px 0" }} />

            {/* Activity */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: c.textTertiary, display: "flex", alignItems: "center", gap: 4 }}>Activity <span style={{ fontSize: 9 }}>▾</span></span>
              <span style={{ fontSize: 12, color: c.textTertiary, cursor: "pointer" }}>See all</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: c.textTertiary }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="4" r="2" /><path d="M2 10c0-2 1.8-3.2 4-3.2s4 1.2 4 3.2" /></svg>
              Tyler R created the project · Feb 26
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MOCKUP 3: Cycle View with Compass in Sidebar
// ============================================
function CycleView() {
  const [expandedSection, setExpandedSection] = useState("coherence");

  const issues = [
    { id: "PLAT-47", title: "API v2 request/response validation layer", labels: [{ text: "Feature", color: c.green }], project: "API v2 Migration" },
    { id: "PLAT-46", title: "Optimize database queries for large dataset pagination", labels: [{ text: "infrastructure", color: c.blue }], project: "API v2 Migration" },
    { id: "PLAT-45", title: "Investigate performance regression after last deploy", labels: [{ text: "Bug", color: c.red }, { text: "urgent", color: c.red }], project: null, flagged: "coherence" },
    { id: "PLAT-43", title: "Users reporting slow performance on large workspaces", labels: [{ text: "Bug", color: c.red }], project: null, flagged: "coherence" },
    { id: "PLAT-42", title: "Implement natural language search", labels: [{ text: "Feature", color: c.green }], project: "Smart Search", flagged: "coherence" },
    { id: "PLAT-34", title: "Implement OAuth2 authorization code flow", labels: [{ text: "Feature", color: c.green }], project: "Auth Service Rewrite" },
    { id: "PLAT-33", title: "Design JWT token rotation strategy", labels: [{ text: "Feature", color: c.green }], project: "Auth Service Rewrite" },
    { id: "PLAT-32", title: "Investigate timeout issues reported by Acme Corp", labels: [{ text: "Bug", color: c.red }, { text: "urgent", color: c.red }], project: "API v2 Migration" },
    { id: "PLAT-31", title: "Fix webhook delivery failures for customer X", labels: [{ text: "Bug", color: c.red }], project: "API v2 Migration", flagged: "carryover" },
    { id: "PLAT-30", title: "Add custom header support per customer request", labels: [{ text: "Feature", color: c.green }], project: "API v2 Migration", flagged: "carryover" },
    { id: "PLAT-29", title: "Fix customer-reported dashboard loading issue", labels: [{ text: "Bug", color: c.red }, { text: "urgent", color: c.red }], project: "API v2 Migration", flagged: "coherence" },
    { id: "PLAT-28", title: "Set up API gateway for v2 routing", labels: [{ text: "infrastructure", color: c.blue }], project: "API v2 Migration" },
    { id: "PLAT-27", title: "Write API v2 migration guide", labels: [{ text: "Feature", color: c.green }], project: "API v2 Migration" },
    { id: "PLAT-26", title: "Implement rate limiting middleware", labels: [{ text: "infrastructure", color: c.blue }], project: "API v2 Migration" },
    { id: "PLAT-25", title: "Design new REST endpoint schema", labels: [{ text: "Feature", color: c.green }], project: "API v2 Migration" },
  ];

  const coherenceIssues = [
    { id: "PLAT-45", title: "Investigate performance regression after last deploy", reason: "This is a general performance debugging task — not related to auth or rate limiting. Likely belongs in a bug-fix or platform health cycle.", confidence: 81 },
    { id: "PLAT-43", title: "Users reporting slow performance on large workspaces", reason: "Customer-reported performance issue unrelated to the cycle's auth and rate limiting scope. This is a scaling/infrastructure concern.", confidence: 79 },
    { id: "PLAT-42", title: "Implement natural language search", reason: "This is a Smart Search project feature — has nothing to do with auth or rate limiting. Likely added to this cycle for convenience.", confidence: 91 },
    { id: "PLAT-29", title: "Fix customer-reported dashboard loading issue", reason: "Frontend rendering bug related to the charting library. Completely unrelated to auth or rate limiting infrastructure.", confidence: 85 },
  ];

  const carryoverIssues = [
    { id: "PLAT-31", title: "Fix webhook delivery failures for customer X", cycles: 3, reason: "This issue has been in the last 3 cycles without progressing. It was created in Sprint 9 and carried through Sprint 10 and 11. Either it's blocked or not actually a priority.", confidence: 88 },
    { id: "PLAT-30", title: "Add custom header support per customer request", cycles: 2, reason: "Carried over from Sprint 11. It was originally scoped for Sprint 10 but deferred twice. The customer who requested it may have found a workaround.", confidence: 74 },
  ];

  return (
    <div style={{ background: c.bg, minHeight: "100vh", fontFamily: font.sans, color: c.text }}>
      <TopBar
        right={<div style={{ display: "flex", gap: 10, color: c.textTertiary, alignItems: "center" }}>
          <span style={{ fontSize: 12, cursor: "pointer" }}>Filter</span>
          <span style={{ fontSize: 12, cursor: "pointer" }}>Display</span>
        </div>}>
        <span style={{ display: "flex", color: c.textTertiary }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: c.purple, marginRight: 6, marginTop: 2 }} />
        </span>
        <span style={{ color: c.textSecondary }}>Platform</span>
        <span style={{ color: c.textTertiary, fontSize: 11 }}>›</span>
        <span style={{ display: "flex", color: c.textTertiary }}>{Icons.cycles}</span>
        <span style={{ color: c.text, fontWeight: 500 }}>Sprint 12 — Auth & Rate Limiting</span>
        <span style={{ display: "flex", color: c.textTertiary, cursor: "pointer" }}>{Icons.star}</span>
      </TopBar>

      <div style={{ display: "flex" }}>
        <Sidebar activeItem="Cycles" />

        {/* Issue list */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {/* Group header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderBottom: `1px solid ${c.border}`, fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c.textTertiary} strokeWidth="1.5"><circle cx="7" cy="7" r="5" /></svg>
            <span style={{ color: c.text, fontWeight: 500 }}>Todo</span>
            <span style={{ color: c.textTertiary }}>{issues.length}</span>
            <span style={{ marginLeft: "auto", color: c.textTertiary, cursor: "pointer" }}>+</span>
          </div>

          {/* Issue rows */}
          {issues.map(issue => (
            <HoverRow key={issue.id} style={{ display: "flex", alignItems: "center", padding: "7px 24px", borderBottom: `1px solid ${c.borderSubtle}`, cursor: "pointer", gap: 10 }}>
              <span style={{ fontSize: 12, color: c.textTertiary, width: 12, flexShrink: 0 }}>···</span>
              <span style={{ fontSize: 12, fontFamily: font.mono, color: c.textSecondary, flexShrink: 0, width: 56 }}>{issue.id}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c.textTertiary} strokeWidth="1.5" style={{ flexShrink: 0 }}><circle cx="7" cy="7" r="5" /></svg>
              <span style={{ fontSize: 13, color: c.text, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {issue.title}
              </span>
              {issue.flagged && (
                <span style={{ display: "flex", color: c.amber, flexShrink: 0 }}>{Icons.compass}</span>
              )}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {issue.labels.map(l => (
                  <span key={l.text} style={{ fontSize: 11, padding: "1px 6px", borderRadius: 100, background: c.surfaceRaised, color: c.textSecondary, fontWeight: 500 }}>{l.text}</span>
                ))}
              </div>
              {issue.project && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: c.textTertiary, flexShrink: 0 }}>
                  <span style={{ display: "flex" }}>{Icons.projects}</span>
                  {issue.project}
                </span>
              )}
              <span style={{ fontSize: 12, color: c.textTertiary, flexShrink: 0 }}>Mar 2</span>
            </HoverRow>
          ))}
        </div>

        {/* Right sidebar */}
        <div style={{ width: 460, flexShrink: 0, borderLeft: `1px solid ${c.border}`, padding: "18px 20px", minHeight: "calc(100vh - 50px)", fontSize: 13, overflowY: "auto" }}>
          {/* Cycle dates */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: c.textSecondary, background: c.surfaceRaised, padding: "2px 8px", borderRadius: 4 }}>Current</span>
            <span style={{ fontSize: 12, color: c.textSecondary }}>Feb 24 → Mar 9</span>
          </div>

          {/* Cycle title */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ display: "flex", color: c.textTertiary }}>{Icons.cycles}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Sprint 12 — Auth & Rate Limiting</span>
          </div>
          <div style={{ fontSize: 12, color: c.textSecondary, lineHeight: 1.5, marginBottom: 8 }}>
            Implement rate limiting middleware, JWT rotation, and OAuth2 flow. Gate: auth service passing OWASP checklist in staging.
          </div>
          <div style={{ fontSize: 12, color: c.textTertiary, marginBottom: 14, cursor: "pointer" }}>+ Add document or link...</div>

          <div style={{ borderTop: `1px solid ${c.border}`, margin: "0 0 12px" }} />

          {/* ======= COMPASS SECTION ======= */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ display: "flex", color: c.amber }}>{Icons.compass}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: c.amber }}>Compass</span>
              <span style={{ background: c.amberDim, color: c.amber, fontSize: 11, fontWeight: 600, padding: "0 5px", borderRadius: 100, fontFamily: font.mono, lineHeight: "18px" }}>{coherenceIssues.length + carryoverIssues.length}</span>
            </div>

            {/* Coherence section */}
            <div style={{ marginBottom: 8 }}>
              <HoverRow onClick={() => setExpandedSection(expandedSection === "coherence" ? null : "coherence")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 4, cursor: "pointer" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.amber, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: c.text, flex: 1 }}>{coherenceIssues.length} issues don't match cycle goal</span>
                <ReasoningToggle reasoning="The cycle is scoped to 'Auth & Rate Limiting' — implementing rate limiting middleware, JWT rotation, and OAuth2. These 4 issues address performance debugging, frontend rendering, and search features, none of which relate to authentication or rate limiting." confidence={84} />
                <span style={{ fontSize: 10, color: c.textTertiary }}>{expandedSection === "coherence" ? "▾" : "›"}</span>
              </HoverRow>

              {expandedSection === "coherence" && (
                <div style={{ paddingLeft: 16, paddingTop: 6 }}>
                  {coherenceIssues.map(d => (
                    <div key={d.id} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontFamily: font.mono, color: c.textSecondary }}>{d.id}</span>
                        <ReasoningToggle reasoning={d.reason} confidence={d.confidence} />
                      </div>
                      <div style={{ fontSize: 12, color: c.textSecondary, lineHeight: 1.4, marginBottom: 4 }}>{d.title}</div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button style={{ background: c.surfaceRaised, border: `1px solid ${c.border}`, borderRadius: 5, padding: "5px 10px", fontSize: 11, color: c.text, cursor: "pointer", fontFamily: font.sans, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8h8M12 8l-3-3M12 8l-3 3"/></svg>
                      Move
                    </button>
                    <button style={{ background: "none", border: `1px solid ${c.border}`, borderRadius: 5, padding: "5px 10px", fontSize: 11, color: c.textSecondary, cursor: "pointer", fontFamily: font.sans, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Carry-over section */}
            <div>
              <HoverRow onClick={() => setExpandedSection(expandedSection === "carryover" ? null : "carryover")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 4, cursor: "pointer" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.amber, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: c.text, flex: 1 }}>{carryoverIssues.length} issues carried over repeatedly</span>
                <ReasoningToggle reasoning="These issues have been moved between cycles multiple times without being completed. This usually indicates the work is either blocked, not actually a priority, or needs to be broken into smaller pieces." confidence={81} />
                <span style={{ fontSize: 10, color: c.textTertiary }}>{expandedSection === "carryover" ? "▾" : "›"}</span>
              </HoverRow>

              {expandedSection === "carryover" && (
                <div style={{ paddingLeft: 16, paddingTop: 6 }}>
                  {carryoverIssues.map(d => (
                    <div key={d.id} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontFamily: font.mono, color: c.textSecondary }}>{d.id}</span>
                        <span style={{ fontSize: 10, fontFamily: font.mono, color: c.amber, background: c.amberDim, padding: "0 4px", borderRadius: 3 }}>{d.cycles} cycles</span>
                        <ReasoningToggle reasoning={d.reason} confidence={d.confidence} />
                      </div>
                      <div style={{ fontSize: 12, color: c.textSecondary, lineHeight: 1.4, marginBottom: 4 }}>{d.title}</div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button style={{ background: c.surfaceRaised, border: `1px solid ${c.border}`, borderRadius: 5, padding: "5px 10px", fontSize: 11, color: c.text, cursor: "pointer", fontFamily: font.sans, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12M2 8h12"/></svg>
                      Split
                    </button>
                    <button style={{ background: "none", border: `1px solid ${c.border}`, borderRadius: 5, padding: "5px 10px", fontSize: 11, color: c.textSecondary, cursor: "pointer", fontFamily: font.sans, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${c.border}`, margin: "0 0 12px" }} />

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: c.textTertiary, display: "flex", alignItems: "center", gap: 4 }}>Progress <span style={{ fontSize: 9 }}>▾</span></span>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: c.textTertiary }}>Scope</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>15</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: c.textTertiary }}>Started</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>0 <span style={{ fontSize: 11, fontWeight: 400, color: c.textTertiary }}>· 0%</span></div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: c.textTertiary }}>Completed</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>0 <span style={{ fontSize: 11, fontWeight: 400, color: c.textTertiary }}>· 0%</span></div>
            </div>
          </div>

          {/* Mini burndown chart placeholder */}
          <div style={{ height: 80, background: c.surface, borderRadius: 6, marginBottom: 16, display: "flex", alignItems: "flex-end", padding: "10px 14px", position: "relative" }}>
            <svg width="100%" height="50" viewBox="0 0 260 50" fill="none" preserveAspectRatio="none">
              <path d="M0 5 L130 25 L260 45" stroke={c.textTertiary} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
              <path d="M0 5 L130 8 L200 10" stroke={c.blue} strokeWidth="2" />
              <circle cx="200" cy="10" r="3" fill={c.blue} />
            </svg>
            <div style={{ position: "absolute", bottom: 4, left: 12, fontSize: 10, color: c.textTertiary }}>Feb 24</div>
            <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: c.textTertiary }}>Mar 2</div>
            <div style={{ position: "absolute", bottom: 4, right: 12, fontSize: 10, color: c.textTertiary }}>Mar 10</div>
          </div>

          {/* Assignees tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 12, borderBottom: `1px solid ${c.border}` }}>
            {["Assignees", "Labels", "Priority", "Projects", "Teams"].map((t, i) => (
              <span key={t} style={{ padding: "6px 8px", fontSize: 11, color: i === 0 ? c.text : c.textTertiary, borderBottom: i === 0 ? `2px solid ${c.text}` : "2px solid transparent", cursor: "pointer" }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: c.textTertiary }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="4" r="2" /><path d="M2 10c0-2 1.8-3.2 4-3.2s4 1.2 4 3.2" /></svg>
            No assignee
            <span style={{ marginLeft: "auto", color: c.textSecondary }}>0% of 15</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP — Tab Navigation
// ============================================
const viewDescriptions = {
  "initiatives-list": "Five issues about performance keep popping up across three different teams, but nobody owns the problem yet. Compass notices the pattern and suggests rolling them into a new initiative.",
  "project-detail": "This project is supposed to be about building Smart Search — but a few issues in here are really just customer bug fixes. Compass flags what doesn't belong and warns when recent work is drifting from the plan.",
  "cycle": "This sprint is scoped to auth and rate limiting. Compass spots four issues that have nothing to do with that goal, plus two that have been quietly carried over for multiple sprints without making progress.",
};

export default function CompassMockups() {
  const [view, setView] = useState("project-detail");
  const [barHeight, setBarHeight] = useState(120);
  const barRef = useRef(null);

  const tabs = [
    { id: "initiatives-list", label: "Initiatives" },
    { id: "project-detail", label: "Projects" },
    { id: "cycle", label: "Cycles" },
  ];

  React.useEffect(() => {
    if (barRef.current) {
      setBarHeight(barRef.current.offsetHeight);
    }
  }, [view]);

  return (
    <div>
      <div ref={barRef} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, background: c.surface, borderBottom: `1px solid ${c.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 0", fontFamily: font.sans }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "flex", color: c.amber, marginRight: 2 }}>{Icons.compass}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: c.text, marginRight: 14 }}>Compass</span>
          <div style={{ display: "flex", background: c.bg, borderRadius: 8, padding: 3, gap: 2, border: `1px solid ${c.border}` }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id)} style={{
                background: view === tab.id ? c.accent : "transparent",
                border: "none",
                borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 500,
                color: view === tab.id ? "white" : c.textSecondary,
                cursor: "pointer", fontFamily: font.sans,
                transition: "all 0.15s ease",
              }}>{tab.label}</button>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 540, textAlign: "center", padding: "12px 20px 14px", fontSize: 12.5, color: c.text, lineHeight: 1.6 }}>
          {viewDescriptions[view]}
        </div>
      </div>
      <div style={{ paddingTop: barHeight }}>
        {view === "initiatives-list" && <InitiativesList />}
        {view === "project-detail" && <ProjectDetail />}
        {view === "cycle" && <CycleView />}
      </div>
    </div>
  );
}
