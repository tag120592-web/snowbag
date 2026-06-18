import React from "react";
import { Icon } from "../core/Icon.jsx";

/** TN list cell / row — mirrors <TNCell>. */
export function Cell({
  title,
  subtitle,
  leftIcon,
  leftSlot,
  rightText,
  rightIcon,
  rightSlot,
  accent = false,
  selected = false,
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const clickable = !!onClick && !disabled;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={clickable ? onClick : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: "var(--radius-md)",
        background: selected
          ? "var(--background-secondary-a-enabled)"
          : hover && clickable
          ? "var(--background-primary-a-hover)"
          : "transparent",
        cursor: clickable ? "pointer" : "default",
        opacity: disabled ? 0.5 : 1,
        transition: "background .12s ease",
        ...style,
      }}
      {...rest}
    >
      {leftSlot}
      {leftIcon && !leftSlot && (
        <Icon name={leftIcon} size={20} color={accent ? "var(--content-accent-enabled)" : "var(--content-secondary-enabled)"} />
      )}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            font: "var(--text-body)",
            fontWeight: "var(--font-weight-medium)",
            color: accent ? "var(--content-accent-enabled)" : "var(--content-primary-a-enabled)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span style={{ font: "var(--text-caption)", color: "var(--content-secondary-enabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {subtitle}
          </span>
        )}
      </div>
      {rightText && <span style={{ font: "var(--text-caption)", color: "var(--content-tertiary-enabled)" }}>{rightText}</span>}
      {rightSlot}
      {rightIcon && !rightSlot && <Icon name={rightIcon} size={18} color="var(--content-tertiary-enabled)" />}
    </div>
  );
}
