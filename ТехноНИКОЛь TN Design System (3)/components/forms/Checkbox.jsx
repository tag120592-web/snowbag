import React from "react";
import { Icon } from "../core/Icon.jsx";

/** TN checkbox — mirrors <TNCheckbox>. */
export function Checkbox({
  checked,
  defaultChecked = false,
  indeterminate = false,
  label,
  description,
  disabled = false,
  onChange,
  style,
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : inner;
  const on = isChecked || indeterminate;

  return (
    <label style={{ display: "inline-flex", alignItems: description ? "flex-start" : "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      <span
        onClick={() => { if (disabled) return; const v = !isChecked; setInner(v); onChange && onChange(v); }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          flex: "0 0 auto",
          marginTop: description ? 1 : 0,
          background: on ? "var(--background-accent-enabled)" : "var(--background-primary-a-enabled)",
          border: `1.5px solid ${on ? "var(--background-accent-enabled)" : "var(--border-secondary-hover)"}`,
          borderRadius: "var(--radius-xs)",
          transition: "background .15s, border-color .15s",
        }}
      >
        {indeterminate ? (
          <Icon name="minus" size={14} color="var(--neutral-white)" />
        ) : isChecked ? (
          <Icon name="check" size={14} color="var(--neutral-white)" />
        ) : null}
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
