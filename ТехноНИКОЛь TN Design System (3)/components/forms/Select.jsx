import React from "react";
import { Icon } from "../core/Icon.jsx";

/** TN dropdown select — mirrors <TNSelector>. */
export function Select({
  label,
  value,
  placeholder = "Выберите",
  options = [],
  size = "md",
  error,
  disabled = false,
  onChange,
  style,
}) {
  const [open, setOpen] = React.useState(false);
  const [inner, setInner] = React.useState(value);
  const current = value !== undefined ? value : inner;
  const selected = options.find((o) => (o.id ?? o.value ?? o) === current);
  const h = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const ref = React.useRef(null);

  React.useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const label_ = (o) => (typeof o === "object" ? o.title ?? o.label : o);
  const id_ = (o) => (typeof o === "object" ? o.id ?? o.value : o);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative", ...style }}>
      {label && (
        <span style={{ font: "var(--text-caption)", fontWeight: "var(--font-weight-medium)", color: "var(--content-secondary-enabled)" }}>{label}</span>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          height: h,
          padding: "0 12px",
          background: disabled ? "var(--background-secondary-a-disabled)" : "var(--background-primary-a-enabled)",
          border: `1px solid ${error ? "var(--border-accent-enabled)" : open ? "var(--border-primary-a-enabled)" : "var(--border-secondary-enabled)"}`,
          borderRadius: "var(--radius-md)",
          font: "var(--font-family-base)",
          fontSize: size === "sm" ? 13 : 14,
          color: selected ? "var(--content-primary-a-enabled)" : "var(--content-tertiary-enabled)",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? label_(selected) : placeholder}
        </span>
        <Icon name="chevron-down" size={18} color="var(--content-tertiary-enabled)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 20,
            background: "var(--background-primary-a-enabled)",
            border: "1px solid var(--border-secondary-enabled)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-large)",
            padding: 4,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {options.map((o, i) => {
            const oid = id_(o);
            const isSel = oid === current;
            return (
              <button
                key={i}
                type="button"
                onClick={() => { setInner(oid); onChange && onChange(oid, o); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 8,
                  padding: "9px 10px",
                  background: isSel ? "var(--background-secondary-a-enabled)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  font: "var(--font-family-base)",
                  fontSize: 14,
                  color: "var(--content-primary-a-enabled)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "var(--background-secondary-a-enabled)"; }}
                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
              >
                {label_(o)}
                {isSel && <Icon name="check" size={16} color="var(--content-accent-enabled)" />}
              </button>
            );
          })}
        </div>
      )}
      {error && <span style={{ font: "var(--text-caption)", color: "var(--content-system-negative)" }}>{error}</span>}
    </div>
  );
}
