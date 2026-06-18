import React from "react";

/** TN switch — mirrors <TNTumbler>. */
export function Switch({
  checked,
  defaultChecked = false,
  label,
  size = "md",
  disabled = false,
  onChange,
  style,
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked !== undefined ? checked : inner;
  const w = size === "sm" ? 32 : 40;
  const h = size === "sm" ? 18 : 24;
  const knob = h - 6;

  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      <span
        onClick={() => { if (disabled) return; const v = !on; setInner(v); onChange && onChange(v); }}
        style={{
          position: "relative",
          width: w,
          height: h,
          flex: "0 0 auto",
          background: on ? "var(--background-accent-enabled)" : "var(--neutral-30)",
          borderRadius: "var(--radius-pill)",
          transition: "background .18s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: on ? w - knob - 3 : 3,
            width: knob,
            height: knob,
            background: "var(--neutral-white)",
            borderRadius: "var(--radius-pill)",
            boxShadow: "0 1px 2px rgba(30,34,40,.3)",
            transition: "left .18s ease",
          }}
        />
      </span>
      {label && <span style={{ font: "var(--text-body)", color: "var(--content-primary-a-enabled)" }}>{label}</span>}
    </label>
  );
}
