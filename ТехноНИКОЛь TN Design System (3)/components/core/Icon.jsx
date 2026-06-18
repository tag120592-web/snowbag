import React from "react";

/**
 * TN icon primitive — mirrors <TNIcon>.
 * The real kit ships a private SVG sprite keyed by `IconNames`. Here we
 * substitute Lucide (stroke 2, 24px grid) loaded from CDN and tinted via
 * CSS mask so the glyph inherits `color`. Pass any Lucide icon name.
 */
export function Icon({
  name = "circle",
  size = 24,
  color = "currentColor",
  style,
  className,
  ...rest
}) {
  const url = `https://cdn.jsdelivr.net/npm/lucide-static@0.460.0/icons/${name}.svg`;
  const s = typeof size === "number" ? `${size}px` : size;
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: s,
        height: s,
        flex: "0 0 auto",
        backgroundColor: color,
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        ...style,
      }}
      {...rest}
    />
  );
}
