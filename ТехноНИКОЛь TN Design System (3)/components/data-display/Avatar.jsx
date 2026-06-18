import React from "react";
import { Icon } from "../core/Icon.jsx";

const SIZES = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };
const STATUS = {
  green: "var(--content-system-positive)",
  yellow: "var(--content-system-warning)",
  red: "var(--content-system-negative)",
  gray: "var(--neutral-45)",
};

/** TN avatar — mirrors <TNUserPicture>. */
export function Avatar({
  text,
  image,
  icon,
  size = "md",
  square = false,
  status,
  color = "var(--neutral-20)",
  style,
}) {
  const s = SIZES[size] || SIZES.md;
  const fs = Math.round(s * 0.38);

  return (
    <span style={{ position: "relative", display: "inline-flex", width: s, height: s, flex: "0 0 auto", ...style }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: s,
          height: s,
          overflow: "hidden",
          background: image ? "transparent" : color,
          color: "var(--content-secondary-enabled)",
          borderRadius: square ? "var(--radius-md)" : "var(--radius-pill)",
          font: "var(--font-family-base)",
          fontSize: fs,
          fontWeight: "var(--font-weight-semibold)",
          textTransform: "uppercase",
        }}
      >
        {image ? (
          <img src={image} alt={text || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : icon ? (
          <Icon name={icon} size={Math.round(s * 0.5)} color="var(--content-secondary-enabled)" />
        ) : (
          text
        )}
      </span>
      {status && (
        <span
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: Math.max(8, Math.round(s * 0.26)),
            height: Math.max(8, Math.round(s * 0.26)),
            background: STATUS[status],
            border: "2px solid var(--neutral-white)",
            borderRadius: "var(--radius-pill)",
          }}
        />
      )}
    </span>
  );
}
