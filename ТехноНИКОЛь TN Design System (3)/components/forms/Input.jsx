import React from "react";
import { Icon } from "../core/Icon.jsx";

const H = { sm: 32, md: 40, lg: 48, xl: 56 };
const FS = { sm: 13, md: 14, lg: 16, xl: 16 };

/** TN text field — mirrors <TNInput>. */
export function Input({
  label,
  value,
  defaultValue,
  placeholder,
  size = "md",
  icon,
  iconRight,
  error,
  warn,
  hint,
  disabled = false,
  type = "text",
  style,
  onChange,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const status = error ? "error" : warn ? "warn" : null;
  const borderColor = disabled
    ? "var(--border-secondary-disabled)"
    : status === "error"
    ? "var(--border-accent-enabled)"
    : status === "warn"
    ? "var(--content-system-warning)"
    : focused
    ? "var(--border-primary-a-enabled)"
    : "var(--border-secondary-enabled)";
  const msg = error || warn || hint;

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <span style={{ font: "var(--text-caption)", fontWeight: "var(--font-weight-medium)", color: "var(--content-secondary-enabled)" }}>
          {label}
        </span>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: H[size],
          padding: "0 12px",
          background: disabled ? "var(--background-secondary-a-disabled)" : "var(--background-primary-a-enabled)",
          border: `1px solid ${borderColor}`,
          borderRadius: "var(--radius-md)",
          boxShadow: focused && !status ? "var(--focus-ring)" : "none",
          transition: "border-color .15s, box-shadow .15s",
          cursor: disabled ? "not-allowed" : "text",
        }}
      >
        {icon && <Icon name={icon} size={size === "sm" ? 16 : 20} color="var(--content-tertiary-enabled)" />}
        <input
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            font: "var(--font-family-base)",
            fontSize: FS[size],
            color: "var(--content-primary-a-enabled)",
            padding: 0,
          }}
          {...rest}
        />
        {iconRight && <Icon name={iconRight} size={size === "sm" ? 16 : 20} color="var(--content-tertiary-enabled)" />}
      </div>
      {msg && (
        <span
          style={{
            font: "var(--text-caption)",
            color: error
              ? "var(--content-system-negative)"
              : warn
              ? "var(--content-system-warning)"
              : "var(--content-tertiary-enabled)",
          }}
        >
          {msg}
        </span>
      )}
    </label>
  );
}
