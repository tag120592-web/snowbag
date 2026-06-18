import React from "react";

/** TN radio button — mirrors <TNRadio>. */
export function Radio({
  checked,
  defaultChecked = false,
  name,
  value,
  label,
  description,
  disabled = false,
  onChange,
  style,
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : inner;

  return (
    <label style={{ display: "inline-flex", alignItems: description ? "flex-start" : "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      <span
        onClick={() => { if (disabled) return; setInner(true); onChange && onChange(value ?? true); }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          flex: "0 0 auto",
          marginTop: description ? 1 : 0,
          background: "var(--background-primary-a-enabled)",
          border: `1.5px solid ${isChecked ? "var(--background-accent-enabled)" : "var(--border-secondary-hover)"}`,
          borderRadius: "var(--radius-pill)",
          transition: "border-color .15s",
        }}
      >
        {isChecked && (
          <span style={{ width: 10, height: 10, borderRadius: "var(--radius-pill)", background: "var(--background-accent-enabled)" }} />
        )}
      </span>
      {(label || description) && (
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {label && <span style={{ font: "var(--text-body)", color: "var(--content-primary-a-enabled)" }}>{label}</span>}
          {description && <span style={{ font: "var(--text-caption)", color: "var(--content-secondary-enabled)" }}>{description}</span>}
        </span>
      )}
    </label>
  );
}
