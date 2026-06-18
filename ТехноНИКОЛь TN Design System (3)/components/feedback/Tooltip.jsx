import React from "react";

/** TN tooltip — mirrors <TNTooltip>. Hover to reveal. */
export function Tooltip({ children, content, position = "top", style }) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    bottom: { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    left: { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
    right: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
  }[position];

  return (
    <span
      style={{ position: "relative", display: "inline-flex", ...style }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            zIndex: 50,
            ...pos,
            padding: "6px 10px",
            maxWidth: 240,
            width: "max-content",
            background: "var(--background-primary-b-enabled)",
            color: "var(--content-primary-b-enabled)",
            font: "var(--text-caption)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-small)",
            pointerEvents: "none",
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
