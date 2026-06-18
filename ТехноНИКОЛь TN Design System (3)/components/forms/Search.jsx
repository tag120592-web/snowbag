import React from "react";
import { Icon } from "../core/Icon.jsx";

/** TN search field — mirrors <TNSearch>. Pill-shaped, gray fill. */
export function Search({
  value,
  defaultValue,
  placeholder = "Поиск",
  size = "md",
  onChange,
  onClear,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const [inner, setInner] = React.useState(defaultValue || "");
  const val = value !== undefined ? value : inner;
  const h = size === "sm" ? 32 : size === "lg" ? 48 : 40;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: h,
        padding: "0 12px",
        background: "var(--background-secondary-a-enabled)",
        border: `1px solid ${focused ? "var(--border-secondary-hover)" : "transparent"}`,
        borderRadius: "var(--radius-pill)",
        transition: "background .15s, border-color .15s",
        ...style,
      }}
    >
      <Icon name="search" size={18} color="var(--content-tertiary-enabled)" />
      <input
        value={val}
        placeholder={placeholder}
        onChange={(e) => { setInner(e.target.value); onChange && onChange(e); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          minWidth: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          fontFamily: "var(--font-family-base)",
          fontSize: size === "sm" ? 13 : 14,
          color: "var(--content-primary-a-enabled)",
        }}
        {...rest}
      />
      {val && (
        <button
          type="button"
          aria-label="Очистить"
          onClick={() => { setInner(""); onClear && onClear(); }}
          style={{ display: "flex", border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
        >
          <Icon name="x" size={16} color="var(--content-tertiary-enabled)" />
        </button>
      )}
    </div>
  );
}
