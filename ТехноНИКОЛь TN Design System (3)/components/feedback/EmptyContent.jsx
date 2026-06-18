import React from "react";
import { Icon } from "../core/Icon.jsx";

/** TN empty / placeholder state — mirrors <TNEmptyContent>. */
export function EmptyContent({
  icon = "inbox",
  title,
  description,
  action,
  style,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
        padding: "40px 24px",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          marginBottom: 8,
          background: "var(--background-secondary-a-enabled)",
          borderRadius: "var(--radius-pill)",
        }}
      >
        <Icon name={icon} size={30} color="var(--content-tertiary-enabled)" />
      </div>
      {title && <div style={{ font: "var(--text-subtitle)", color: "var(--content-primary-a-enabled)" }}>{title}</div>}
      {description && (
        <div style={{ font: "var(--text-body)", color: "var(--content-secondary-enabled)", maxWidth: 340 }}>{description}</div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
