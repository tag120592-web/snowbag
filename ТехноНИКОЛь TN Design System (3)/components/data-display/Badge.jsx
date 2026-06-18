import React from "react";

/** TN badge — small count or dot notification. */
export function Badge({ count, dot = false, tone = "red", max = 99, children, style }) {
  const bg = tone === "red" ? "var(--background-accent-enabled)"
    : tone === "neutral" ? "var(--neutral-50)"
    : tone === "green" ? "var(--content-system-positive)"
    : "var(--content-action-enabled)";

  const badge = dot ? (
    <span style={{ width: 8, height: 8, borderRadius: "var(--radius-pill)", background: bg, ...(!children ? style : {}) }} />
  ) : (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        background: bg,
        color: "var(--neutral-white)",
        font: "var(--font-family-base)",
        fontSize: 11,
        fontWeight: "var(--font-weight-bold)",
        lineHeight: 1,
        borderRadius: "var(--radius-pill)",
        boxSizing: "border-box",
        ...(!children ? style : {}),
      }}
    >
      {count > max ? `${max}+` : count}
    </span>
  );

  if (!children) return badge;
  return (
    <span style={{ position: "relative", display: "inline-flex", ...style }}>
      {children}
      <span style={{ position: "absolute", top: -4, right: -4 }}>{badge}</span>
    </span>
  );
}
