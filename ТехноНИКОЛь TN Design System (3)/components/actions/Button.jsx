import React from "react";
import { Icon } from "../core/Icon.jsx";

const SIZES = {
  sm: { h: 32, fs: 13, pad: 12, gap: 6, icon: 16, radius: "var(--radius-md)" },
  md: { h: 40, fs: 14, pad: 16, gap: 8, icon: 20, radius: "var(--radius-md)" },
  lg: { h: 48, fs: 16, pad: 20, gap: 8, icon: 20, radius: "var(--radius-md)" },
  xl: { h: 56, fs: 16, pad: 24, gap: 10, icon: 24, radius: "var(--radius-lg)" },
};

const VARIANTS = {
  primary: {
    "--bg": "var(--background-primary-b-enabled)",
    "--bg-hover": "var(--background-primary-b-hover)",
    "--bg-active": "var(--background-primary-b-pressed)",
    "--fg": "var(--content-primary-b-enabled)",
    "--bd": "transparent",
  },
  accent: {
    "--bg": "var(--background-accent-enabled)",
    "--bg-hover": "var(--background-accent-hover)",
    "--bg-active": "var(--background-accent-pressed)",
    "--fg": "var(--content-primary-b-enabled)",
    "--bd": "transparent",
  },
  secondary: {
    "--bg": "var(--background-secondary-enabled)",
    "--bg-hover": "var(--background-secondary-hover)",
    "--bg-active": "var(--background-secondary-pressed)",
    "--fg": "var(--content-primary-a-enabled)",
    "--bd": "transparent",
  },
  white: {
    "--bg": "var(--background-primary-a-enabled)",
    "--bg-hover": "var(--background-primary-a-hover)",
    "--bg-active": "var(--background-primary-a-pressed)",
    "--fg": "var(--content-primary-a-enabled)",
    "--bd": "var(--border-secondary-enabled)",
  },
  outline: {
    "--bg": "transparent",
    "--bg-hover": "var(--background-secondary-a-enabled)",
    "--bg-active": "var(--background-secondary-a-hover)",
    "--fg": "var(--content-primary-a-enabled)",
    "--bd": "var(--border-primary-a-enabled)",
  },
  link: {
    "--bg": "transparent",
    "--bg-hover": "transparent",
    "--bg-active": "transparent",
    "--fg": "var(--content-accent-enabled)",
    "--bd": "transparent",
  },
};

/**
 * TN button — mirrors <TNButton>.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  block = false,
  rounded = false,
  loading = false,
  disabled = false,
  type = "button",
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isIconOnly = (icon || iconRight) && children == null;
  const isLink = variant === "link";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      style={{
        ...v,
        display: block ? "flex" : "inline-flex",
        width: block ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        height: s.h,
        padding: isIconOnly ? 0 : isLink ? "0 4px" : `0 ${s.pad}px`,
        minWidth: isIconOnly ? s.h : undefined,
        fontFamily: "var(--font-family-base)",
        fontSize: s.fs,
        fontWeight: "var(--font-weight-semibold)",
        lineHeight: 1,
        color: "var(--fg)",
        background: "var(--bg)",
        border: "1px solid var(--bd)",
        borderRadius: rounded ? "var(--radius-pill)" : s.radius,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        textDecoration: isLink ? "none" : undefined,
        transition: "background-color .15s ease, color .15s ease, opacity .15s ease",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.background = "var(--bg-hover)"; if (isLink && !disabled) e.currentTarget.style.color = "var(--content-accent-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg)"; if (isLink) e.currentTarget.style.color = "var(--fg)"; }}
      onMouseDown={(e) => { if (!disabled && !loading) e.currentTarget.style.background = "var(--bg-active)"; }}
      onMouseUp={(e) => { if (!disabled && !loading) e.currentTarget.style.background = "var(--bg-hover)"; }}
      {...rest}
    >
      {loading ? (
        <Icon name="loader-circle" size={s.icon} style={{ animation: "tn-spin 0.7s linear infinite" }} />
      ) : (
        <>
          {icon && <Icon name={icon} size={s.icon} />}
          {children != null && <span style={{ textDecoration: isLink ? "none" : undefined }}>{children}</span>}
          {iconRight && <Icon name={iconRight} size={s.icon} />}
        </>
      )}
      <style>{`@keyframes tn-spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
