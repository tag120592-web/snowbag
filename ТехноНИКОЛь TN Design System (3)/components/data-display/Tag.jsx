import React from "react";
import { Icon } from "../core/Icon.jsx";

const TONES = {
  neutral: { bg: "var(--background-secondary-a-enabled)", fg: "var(--content-secondary-enabled)" },
  red: { bg: "var(--red-10)", fg: "var(--red-65)" },
  green: { bg: "var(--green-10)", fg: "var(--green-65)" },
  blue: { bg: "var(--blue-10)", fg: "var(--blue-65)" },
  orange: { bg: "var(--orange-10)", fg: "var(--orange-65)" },
  yellow: { bg: "var(--yellow-10)", fg: "var(--yellow-65)" },
  purple: { bg: "var(--purple-10)", fg: "var(--purple-65)" },
};

/** TN tag / chip — mirrors <TNTag>. */
export function Tag({
  children,
  tone = "neutral",
  size = "md",
  icon,
  solid = false,
  removable = false,
  onRemove,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const sm = size === "sm";
  const bg = solid ? t.fg : t.bg;
  const fg = solid ? "var(--neutral-white)" : t.fg;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: sm ? 4 : 6,
        height: sm ? 22 : 28,
        padding: sm ? "0 8px" : "0 10px",
        background: bg,
        color: fg,
        font: "var(--font-family-base)",
        fontSize: sm ? 12 : 13,
        fontWeight: "var(--font-weight-medium)",
        borderRadius: "var(--radius-sm)",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={sm ? 13 : 15} color={fg} />}
      {children}
      {removable && (
        <button
          type="button"
          aria-label="Удалить"
          onClick={onRemove}
          style={{ display: "flex", border: "none", background: "transparent", padding: 0, marginLeft: 1, cursor: "pointer" }}
        >
          <Icon name="x" size={sm ? 13 : 15} color={fg} />
        </button>
      )}
    </span>
  );
}
