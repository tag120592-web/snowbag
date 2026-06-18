import React from "react";
import { Icon } from "../core/Icon.jsx";

/** TN breadcrumbs — mirrors <TNBreadcrumbs>. */
export function Breadcrumbs({ items = [], onNavigate, style }) {
  return (
    <nav style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, ...style }}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span
              onClick={() => !last && onNavigate && onNavigate(it, i)}
              style={{
                font: "var(--text-body)",
                fontWeight: last ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                color: last ? "var(--content-primary-a-enabled)" : "var(--content-secondary-enabled)",
                cursor: last ? "default" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {it.text}
            </span>
            {!last && <Icon name="chevron-right" size={16} color="var(--content-tertiary-enabled)" />}
          </span>
        );
      })}
    </nav>
  );
}
