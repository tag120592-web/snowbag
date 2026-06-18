import React from "react";

/** TN multiline text field — mirrors <TNTextarea>. */
export function Textarea({
  label,
  value,
  defaultValue,
  placeholder,
  rows = 4,
  error,
  hint,
  disabled = false,
  resize = "vertical",
  style,
  onChange,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = disabled
    ? "var(--border-secondary-disabled)"
    : error
    ? "var(--border-accent-enabled)"
    : focused
    ? "var(--border-primary-a-enabled)"
    : "var(--border-secondary-enabled)";

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <span style={{ font: "var(--text-caption)", fontWeight: "var(--font-weight-medium)", color: "var(--content-secondary-enabled)" }}>
          {label}
        </span>
      )}
      <textarea
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 12px",
          background: disabled ? "var(--background-secondary-a-disabled)" : "var(--background-primary-a-enabled)",
          border: `1px solid ${borderColor}`,
          borderRadius: "var(--radius-md)",
          boxShadow: focused && !error ? "var(--focus-ring)" : "none",
          font: "var(--font-family-base)",
          fontSize: 14,
          lineHeight: "20px",
          color: "var(--content-primary-a-enabled)",
          resize,
          outline: "none",
          transition: "border-color .15s, box-shadow .15s",
        }}
        {...rest}
      />
      {(error || hint) && (
        <span style={{ font: "var(--text-caption)", color: error ? "var(--content-system-negative)" : "var(--content-tertiary-enabled)" }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
