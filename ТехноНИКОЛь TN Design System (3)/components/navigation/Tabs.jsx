import React from "react";
import { Icon } from "../core/Icon.jsx";

/** TN tabs — mirrors <TNTabs>. */
export function Tabs({
  options = [],
  value,
  variant = "underline",
  size = "md",
  onChange,
  style,
}) {
  const [inner, setInner] = React.useState(value ?? options[0]?.id);
  const active = value !== undefined ? value : inner;
  const select = (id) => { setInner(id); onChange && onChange(id); };
  const segmented = variant === "segmented";
  const fs = size === "sm" ? 13 : 14;

  return (
    <div
      style={{
        display: "inline-flex",
        gap: segmented ? 2 : 4,
        padding: segmented ? 3 : 0,
        background: segmented ? "var(--background-secondary-a-enabled)" : "transparent",
        borderRadius: segmented ? "var(--radius-md)" : 0,
        borderBottom: segmented ? "none" : "1px solid var(--border-secondary-enabled)",
        ...style,
      }}
    >
      {options.map((o) => {
        const isActive = o.id === active;
        return (
          <button
            key={o.id}
            type="button"
            disabled={o.disabled}
            onClick={() => !o.disabled && select(o.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: segmented ? 30 : size === "sm" ? 34 : 40,
              padding: segmented ? "0 14px" : "0 4px",
              marginBottom: segmented ? 0 : -1,
              border: "none",
              background: segmented && isActive ? "var(--background-primary-a-enabled)" : "transparent",
              borderRadius: segmented ? "var(--radius-sm)" : 0,
              borderBottom: segmented ? "none" : `2px solid ${isActive ? "var(--background-accent-enabled)" : "transparent"}`,
              boxShadow: segmented && isActive ? "var(--shadow-small)" : "none",
              font: "var(--font-family-base)",
              fontSize: fs,
              fontWeight: "var(--font-weight-semibold)",
              color: isActive ? "var(--content-primary-a-enabled)" : "var(--content-secondary-enabled)",
              cursor: o.disabled ? "not-allowed" : "pointer",
              opacity: o.disabled ? 0.5 : 1,
              whiteSpace: "nowrap",
              transition: "color .12s",
            }}
          >
            {o.icon && <Icon name={o.icon} size={size === "sm" ? 16 : 18} color={isActive ? "var(--content-accent-enabled)" : "var(--content-tertiary-enabled)"} />}
            {o.name}
            {o.secondaryText != null && (
              <span style={{ font: "var(--text-caption)", color: "var(--content-tertiary-enabled)", fontWeight: "var(--font-weight-medium)" }}>
                {o.secondaryText}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
