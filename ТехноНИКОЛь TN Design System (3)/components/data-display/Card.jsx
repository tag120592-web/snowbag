import React from "react";

const PADS = { none: 0, sm: 12, md: 16, lg: 24 };

/** TN surface card — mirrors <TNCard>. */
export function Card({
  children,
  padding = "md",
  elevation = "none",
  bordered = true,
  radius = "var(--radius-lg)",
  hoverable = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const shadow = elevation === "large" ? "var(--shadow-large)" : elevation === "small" ? "var(--shadow-small)" : "none";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--background-primary-a-enabled)",
        border: bordered ? "1px solid var(--border-secondary-enabled)" : "none",
        borderRadius: radius,
        padding: PADS[padding] ?? padding,
        boxShadow: hoverable && hover ? "var(--shadow-small)" : shadow,
        transition: "box-shadow .15s ease, border-color .15s ease",
        cursor: hoverable ? "pointer" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
