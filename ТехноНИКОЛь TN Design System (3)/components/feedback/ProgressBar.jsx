import React from "react";

/** TN progress bar — mirrors <TNProgressBar>. */
export function ProgressBar({
  value = 0,
  max = 100,
  tone = "accent",
  size = "md",
  label,
  showValue = false,
  indeterminate = false,
  style,
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = size === "sm" ? 4 : size === "lg" ? 10 : 6;
  const color =
    tone === "accent" ? "var(--background-accent-enabled)"
    : tone === "positive" ? "var(--content-system-positive)"
    : tone === "warning" ? "var(--content-system-warning)"
    : "var(--content-action-enabled)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", font: "var(--text-caption)", color: "var(--content-secondary-enabled)" }}>
          <span>{label}</span>
          {showValue && <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ position: "relative", height: h, background: "var(--background-tertiary-enabled)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: indeterminate ? "40%" : `${pct}%`,
            background: color,
            borderRadius: "var(--radius-pill)",
            transition: "width .3s ease",
            animation: indeterminate ? "tn-progress 1.1s ease-in-out infinite" : undefined,
          }}
        />
      </div>
      <style>{`@keyframes tn-progress{0%{left:-40%}100%{left:100%}}`}</style>
    </div>
  );
}
