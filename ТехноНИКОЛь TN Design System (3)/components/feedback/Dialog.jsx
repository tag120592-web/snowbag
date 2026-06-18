import React from "react";
import { Icon } from "../core/Icon.jsx";

/** TN modal dialog — mirrors <TNPopup>. */
export function Dialog({
  open = true,
  title,
  children,
  footer,
  width = 480,
  onClose,
  style,
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(30,34,40,.45)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--background-primary-a-enabled)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-large)",
          overflow: "hidden",
          ...style,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "20px 24px 12px" }}>
          <div style={{ flex: 1, font: "var(--text-title)", fontSize: 20, lineHeight: "26px", color: "var(--content-primary-a-enabled)" }}>
            {title}
          </div>
          {onClose && (
            <button type="button" aria-label="Закрыть" onClick={onClose} style={{ display: "flex", border: "none", background: "transparent", padding: 4, margin: -4, cursor: "pointer", borderRadius: "var(--radius-sm)" }}>
              <Icon name="x" size={22} color="var(--content-tertiary-enabled)" />
            </button>
          )}
        </div>
        <div style={{ padding: "0 24px 20px", overflowY: "auto", font: "var(--text-body)", color: "var(--content-secondary-enabled)" }}>
          {children}
        </div>
        {footer && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 24px", borderTop: "1px solid var(--border-secondary-enabled)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
