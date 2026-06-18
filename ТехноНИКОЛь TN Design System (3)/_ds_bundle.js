/* @ds-bundle: {"format":3,"namespace":"TNDesignSystem_7f9df2","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"Cell","sourcePath":"components/data-display/Cell.jsx"},{"name":"Tag","sourcePath":"components/data-display/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"EmptyContent","sourcePath":"components/feedback/EmptyContent.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Search","sourcePath":"components/forms/Search.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Breadcrumbs","sourcePath":"components/navigation/Breadcrumbs.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"a4ca6e4abb18","components/core/Icon.jsx":"3d86084d4726","components/data-display/Avatar.jsx":"00e100964ccd","components/data-display/Badge.jsx":"598dac60dfad","components/data-display/Card.jsx":"9dac92620fd9","components/data-display/Cell.jsx":"0e786f342f76","components/data-display/Tag.jsx":"ab47ea520302","components/feedback/Dialog.jsx":"fbc66d7c757f","components/feedback/EmptyContent.jsx":"8e44978c51c8","components/feedback/ProgressBar.jsx":"4fea054e8d7a","components/feedback/Tooltip.jsx":"f7b999600dda","components/forms/Checkbox.jsx":"ebb4e1f19626","components/forms/Input.jsx":"2854f953ef48","components/forms/Radio.jsx":"87bda262eee5","components/forms/Search.jsx":"51a459c24d30","components/forms/Select.jsx":"c171b48083c7","components/forms/Switch.jsx":"ab4daac2d3e2","components/forms/Textarea.jsx":"d517907a8955","components/navigation/Breadcrumbs.jsx":"29f1a21c3c79","components/navigation/Tabs.jsx":"bb43d7fbd975","ui_kits/auditor/AdminDashboard.jsx":"f964521cd65e","ui_kits/auditor/AgentLanding.jsx":"6b3b38a3331a","ui_kits/auditor/AuditorReport.jsx":"c6201a6bd916","ui_kits/auditor/Sidebar.jsx":"8889260b3279","ui_kits/auditor/Topbar.jsx":"eb96ab5d741c","ui_kits/auditor/app.jsx":"6420b7da0036","ui_kits/auditor/data.js":"80ec279bfac4","ui_kits/snow/build/Projects.jsx":"17240f520149","ui_kits/snow/build/Result.jsx":"24a3202f9574","ui_kits/snow/build/RoofCanvas.jsx":"a5e462801e70","ui_kits/snow/build/Shell.jsx":"446034d3ac63","ui_kits/snow/build/StepsA.jsx":"49d5ebcf46e6","ui_kits/snow/build/StepsB.jsx":"46c7054b5a7d","ui_kits/snow/build/app.jsx":"6718f82ee6aa","ui_kits/snow/build/data.js":"e22a0eba5dd2"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TNDesignSystem_7f9df2 = window.TNDesignSystem_7f9df2 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TN icon primitive — mirrors <TNIcon>.
 * The real kit ships a private SVG sprite keyed by `IconNames`. Here we
 * substitute Lucide (stroke 2, 24px grid) loaded from CDN and tinted via
 * CSS mask so the glyph inherits `color`. Pass any Lucide icon name.
 */
function Icon({
  name = "circle",
  size = 24,
  color = "currentColor",
  style,
  className,
  ...rest
}) {
  const url = `https://cdn.jsdelivr.net/npm/lucide-static@0.460.0/icons/${name}.svg`;
  const s = typeof size === "number" ? `${size}px` : size;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    "aria-hidden": "true",
    style: {
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
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    h: 32,
    fs: 13,
    pad: 12,
    gap: 6,
    icon: 16,
    radius: "var(--radius-md)"
  },
  md: {
    h: 40,
    fs: 14,
    pad: 16,
    gap: 8,
    icon: 20,
    radius: "var(--radius-md)"
  },
  lg: {
    h: 48,
    fs: 16,
    pad: 20,
    gap: 8,
    icon: 20,
    radius: "var(--radius-md)"
  },
  xl: {
    h: 56,
    fs: 16,
    pad: 24,
    gap: 10,
    icon: 24,
    radius: "var(--radius-lg)"
  }
};
const VARIANTS = {
  primary: {
    "--bg": "var(--background-primary-b-enabled)",
    "--bg-hover": "var(--background-primary-b-hover)",
    "--bg-active": "var(--background-primary-b-pressed)",
    "--fg": "var(--content-primary-b-enabled)",
    "--bd": "transparent"
  },
  accent: {
    "--bg": "var(--background-accent-enabled)",
    "--bg-hover": "var(--background-accent-hover)",
    "--bg-active": "var(--background-accent-pressed)",
    "--fg": "var(--content-primary-b-enabled)",
    "--bd": "transparent"
  },
  secondary: {
    "--bg": "var(--background-secondary-enabled)",
    "--bg-hover": "var(--background-secondary-hover)",
    "--bg-active": "var(--background-secondary-pressed)",
    "--fg": "var(--content-primary-a-enabled)",
    "--bd": "transparent"
  },
  white: {
    "--bg": "var(--background-primary-a-enabled)",
    "--bg-hover": "var(--background-primary-a-hover)",
    "--bg-active": "var(--background-primary-a-pressed)",
    "--fg": "var(--content-primary-a-enabled)",
    "--bd": "var(--border-secondary-enabled)"
  },
  outline: {
    "--bg": "transparent",
    "--bg-hover": "var(--background-secondary-a-enabled)",
    "--bg-active": "var(--background-secondary-a-hover)",
    "--fg": "var(--content-primary-a-enabled)",
    "--bd": "var(--border-primary-a-enabled)"
  },
  link: {
    "--bg": "transparent",
    "--bg-hover": "transparent",
    "--bg-active": "transparent",
    "--fg": "var(--content-accent-enabled)",
    "--bd": "transparent"
  }
};

/**
 * TN button — mirrors <TNButton>.
 */
function Button({
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
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled || loading,
    style: {
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
      ...style
    },
    onMouseEnter: e => {
      if (!disabled && !loading) e.currentTarget.style.background = "var(--bg-hover)";
      if (isLink && !disabled) e.currentTarget.style.color = "var(--content-accent-hover)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = "var(--bg)";
      if (isLink) e.currentTarget.style.color = "var(--fg)";
    },
    onMouseDown: e => {
      if (!disabled && !loading) e.currentTarget.style.background = "var(--bg-active)";
    },
    onMouseUp: e => {
      if (!disabled && !loading) e.currentTarget.style.background = "var(--bg-hover)";
    }
  }, rest), loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader-circle",
    size: s.icon,
    style: {
      animation: "tn-spin 0.7s linear infinite"
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }), children != null && /*#__PURE__*/React.createElement("span", {
    style: {
      textDecoration: isLink ? "none" : undefined
    }
  }, children), iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon
  })), /*#__PURE__*/React.createElement("style", null, `@keyframes tn-spin{to{transform:rotate(360deg)}}`));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64
};
const STATUS = {
  green: "var(--content-system-positive)",
  yellow: "var(--content-system-warning)",
  red: "var(--content-system-negative)",
  gray: "var(--neutral-45)"
};

/** TN avatar — mirrors <TNUserPicture>. */
function Avatar({
  text,
  image,
  icon,
  size = "md",
  square = false,
  status,
  color = "var(--neutral-20)",
  style
}) {
  const s = SIZES[size] || SIZES.md;
  const fs = Math.round(s * 0.38);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      width: s,
      height: s,
      flex: "0 0 auto",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
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
      textTransform: "uppercase"
    }
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: text || "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(s * 0.5),
    color: "var(--content-secondary-enabled)"
  }) : text), status && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: Math.max(8, Math.round(s * 0.26)),
      height: Math.max(8, Math.round(s * 0.26)),
      background: STATUS[status],
      border: "2px solid var(--neutral-white)",
      borderRadius: "var(--radius-pill)"
    }
  }));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
/** TN badge — small count or dot notification. */
function Badge({
  count,
  dot = false,
  tone = "red",
  max = 99,
  children,
  style
}) {
  const bg = tone === "red" ? "var(--background-accent-enabled)" : tone === "neutral" ? "var(--neutral-50)" : tone === "green" ? "var(--content-system-positive)" : "var(--content-action-enabled)";
  const badge = dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "var(--radius-pill)",
      background: bg,
      ...(!children ? style : {})
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 18,
      height: 18,
      padding: "0 5px",
      background: bg,
      color: "var(--neutral-white)",
      font: "var(--font-family-base)",
      fontSize: 11,
      fontWeight: "var(--font-weight-bold)",
      lineHeight: 1,
      borderRadius: "var(--radius-pill)",
      boxSizing: "border-box",
      ...(!children ? style : {})
    }
  }, count > max ? `${max}+` : count);
  if (!children) return badge;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    }
  }, children, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -4,
      right: -4
    }
  }, badge));
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PADS = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 24
};

/** TN surface card — mirrors <TNCard>. */
function Card({
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
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: "var(--background-primary-a-enabled)",
      border: bordered ? "1px solid var(--border-secondary-enabled)" : "none",
      borderRadius: radius,
      padding: PADS[padding] ?? padding,
      boxShadow: hoverable && hover ? "var(--shadow-small)" : shadow,
      transition: "box-shadow .15s ease, border-color .15s ease",
      cursor: hoverable ? "pointer" : undefined,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Cell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** TN list cell / row — mirrors <TNCell>. */
function Cell({
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
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: clickable ? onClick : undefined,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      borderRadius: "var(--radius-md)",
      background: selected ? "var(--background-secondary-a-enabled)" : hover && clickable ? "var(--background-primary-a-hover)" : "transparent",
      cursor: clickable ? "pointer" : "default",
      opacity: disabled ? 0.5 : 1,
      transition: "background .12s ease",
      ...style
    }
  }, rest), leftSlot, leftIcon && !leftSlot && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: leftIcon,
    size: 20,
    color: accent ? "var(--content-accent-enabled)" : "var(--content-secondary-enabled)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-body)",
      fontWeight: "var(--font-weight-medium)",
      color: accent ? "var(--content-accent-enabled)" : "var(--content-primary-a-enabled)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      color: "var(--content-secondary-enabled)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, subtitle)), rightText && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      color: "var(--content-tertiary-enabled)"
    }
  }, rightText), rightSlot, rightIcon && !rightSlot && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: rightIcon,
    size: 18,
    color: "var(--content-tertiary-enabled)"
  }));
}
Object.assign(__ds_scope, { Cell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Cell.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: "var(--background-secondary-a-enabled)",
    fg: "var(--content-secondary-enabled)"
  },
  red: {
    bg: "var(--red-10)",
    fg: "var(--red-65)"
  },
  green: {
    bg: "var(--green-10)",
    fg: "var(--green-65)"
  },
  blue: {
    bg: "var(--blue-10)",
    fg: "var(--blue-65)"
  },
  orange: {
    bg: "var(--orange-10)",
    fg: "var(--orange-65)"
  },
  yellow: {
    bg: "var(--yellow-10)",
    fg: "var(--yellow-65)"
  },
  purple: {
    bg: "var(--purple-10)",
    fg: "var(--purple-65)"
  }
};

/** TN tag / chip — mirrors <TNTag>. */
function Tag({
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
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: sm ? 13 : 15,
    color: fg
  }), children, removable && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
    onClick: onRemove,
    style: {
      display: "flex",
      border: "none",
      background: "transparent",
      padding: 0,
      marginLeft: 1,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: sm ? 13 : 15,
    color: fg
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
/** TN modal dialog — mirrors <TNPopup>. */
function Dialog({
  open = true,
  title,
  children,
  footer,
  width = 480,
  onClose,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "rgba(30,34,40,.45)",
      backdropFilter: "blur(2px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width,
      maxWidth: "100%",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--background-primary-a-enabled)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-large)",
      overflow: "hidden",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "20px 24px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      font: "var(--text-title)",
      fontSize: 20,
      lineHeight: "26px",
      color: "var(--content-primary-a-enabled)"
    }
  }, title), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    onClick: onClose,
    style: {
      display: "flex",
      border: "none",
      background: "transparent",
      padding: 4,
      margin: -4,
      cursor: "pointer",
      borderRadius: "var(--radius-sm)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 22,
    color: "var(--content-tertiary-enabled)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 24px 20px",
      overflowY: "auto",
      font: "var(--text-body)",
      color: "var(--content-secondary-enabled)"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      padding: "16px 24px",
      borderTop: "1px solid var(--border-secondary-enabled)"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyContent.jsx
try { (() => {
/** TN empty / placeholder state — mirrors <TNEmptyContent>. */
function EmptyContent({
  icon = "inbox",
  title,
  description,
  action,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: 8,
      padding: "40px 24px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 64,
      height: 64,
      marginBottom: 8,
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-pill)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 30,
    color: "var(--content-tertiary-enabled)"
  })), title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--text-subtitle)",
      color: "var(--content-primary-a-enabled)"
    }
  }, title), description && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--text-body)",
      color: "var(--content-secondary-enabled)",
      maxWidth: 340
    }
  }, description), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyContent });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyContent.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
/** TN progress bar — mirrors <TNProgressBar>. */
function ProgressBar({
  value = 0,
  max = 100,
  tone = "accent",
  size = "md",
  label,
  showValue = false,
  indeterminate = false,
  style
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const h = size === "sm" ? 4 : size === "lg" ? 10 : 6;
  const color = tone === "accent" ? "var(--background-accent-enabled)" : tone === "positive" ? "var(--content-system-positive)" : tone === "warning" ? "var(--content-system-warning)" : "var(--content-action-enabled)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      font: "var(--text-caption)",
      color: "var(--content-secondary-enabled)"
    }
  }, /*#__PURE__*/React.createElement("span", null, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--font-weight-semibold)"
    }
  }, Math.round(pct), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: h,
      background: "var(--background-tertiary-enabled)",
      borderRadius: "var(--radius-pill)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: indeterminate ? "40%" : `${pct}%`,
      background: color,
      borderRadius: "var(--radius-pill)",
      transition: "width .3s ease",
      animation: indeterminate ? "tn-progress 1.1s ease-in-out infinite" : undefined
    }
  })), /*#__PURE__*/React.createElement("style", null, `@keyframes tn-progress{0%{left:-40%}100%{left:100%}}`));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/** TN tooltip — mirrors <TNTooltip>. Hover to reveal. */
function Tooltip({
  children,
  content,
  position = "top",
  style
}) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: {
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    bottom: {
      top: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    left: {
      right: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    },
    right: {
      left: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    }
  }[position];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false)
  }, children, show && content && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      zIndex: 50,
      ...pos,
      padding: "6px 10px",
      maxWidth: 240,
      width: "max-content",
      background: "var(--background-primary-b-enabled)",
      color: "var(--content-primary-b-enabled)",
      font: "var(--text-caption)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-small)",
      pointerEvents: "none"
    }
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/** TN checkbox — mirrors <TNCheckbox>. */
function Checkbox({
  checked,
  defaultChecked = false,
  indeterminate = false,
  label,
  description,
  disabled = false,
  onChange,
  style
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : inner;
  const on = isChecked || indeterminate;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: description ? "flex-start" : "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => {
      if (disabled) return;
      const v = !isChecked;
      setInner(v);
      onChange && onChange(v);
    },
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      flex: "0 0 auto",
      marginTop: description ? 1 : 0,
      background: on ? "var(--background-accent-enabled)" : "var(--background-primary-a-enabled)",
      border: `1.5px solid ${on ? "var(--background-accent-enabled)" : "var(--border-secondary-hover)"}`,
      borderRadius: "var(--radius-xs)",
      transition: "background .15s, border-color .15s"
    }
  }, indeterminate ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "minus",
    size: 14,
    color: "var(--neutral-white)"
  }) : isChecked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 14,
    color: "var(--neutral-white)"
  }) : null), (label || description) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-body)",
      color: "var(--content-primary-a-enabled)"
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      color: "var(--content-secondary-enabled)"
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const H = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56
};
const FS = {
  sm: 13,
  md: 14,
  lg: 16,
  xl: 16
};

/** TN text field — mirrors <TNInput>. */
function Input({
  label,
  value,
  defaultValue,
  placeholder,
  size = "md",
  icon,
  iconRight,
  error,
  warn,
  hint,
  disabled = false,
  type = "text",
  style,
  onChange,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const status = error ? "error" : warn ? "warn" : null;
  const borderColor = disabled ? "var(--border-secondary-disabled)" : status === "error" ? "var(--border-accent-enabled)" : status === "warn" ? "var(--content-system-warning)" : focused ? "var(--border-primary-a-enabled)" : "var(--border-secondary-enabled)";
  const msg = error || warn || hint;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--content-secondary-enabled)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: H[size],
      padding: "0 12px",
      background: disabled ? "var(--background-secondary-a-disabled)" : "var(--background-primary-a-enabled)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focused && !status ? "var(--focus-ring)" : "none",
      transition: "border-color .15s, box-shadow .15s",
      cursor: disabled ? "not-allowed" : "text"
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === "sm" ? 16 : 20,
    color: "var(--content-tertiary-enabled)"
  }), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      font: "var(--font-family-base)",
      fontSize: FS[size],
      color: "var(--content-primary-a-enabled)",
      padding: 0
    }
  }, rest)), iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: size === "sm" ? 16 : 20,
    color: "var(--content-tertiary-enabled)"
  })), msg && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      color: error ? "var(--content-system-negative)" : warn ? "var(--content-system-warning)" : "var(--content-tertiary-enabled)"
    }
  }, msg));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
/** TN radio button — mirrors <TNRadio>. */
function Radio({
  checked,
  defaultChecked = false,
  name,
  value,
  label,
  description,
  disabled = false,
  onChange,
  style
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : inner;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: description ? "flex-start" : "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => {
      if (disabled) return;
      setInner(true);
      onChange && onChange(value ?? true);
    },
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      flex: "0 0 auto",
      marginTop: description ? 1 : 0,
      background: "var(--background-primary-a-enabled)",
      border: `1.5px solid ${isChecked ? "var(--background-accent-enabled)" : "var(--border-secondary-hover)"}`,
      borderRadius: "var(--radius-pill)",
      transition: "border-color .15s"
    }
  }, isChecked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "var(--radius-pill)",
      background: "var(--background-accent-enabled)"
    }
  })), (label || description) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-body)",
      color: "var(--content-primary-a-enabled)"
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      color: "var(--content-secondary-enabled)"
    }
  }, description)));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Search.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** TN search field — mirrors <TNSearch>. Pill-shaped, gray fill. */
function Search({
  value,
  defaultValue,
  placeholder = "Поиск",
  size = "md",
  onChange,
  onClear,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const [inner, setInner] = React.useState(defaultValue || "");
  const val = value !== undefined ? value : inner;
  const h = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: h,
      padding: "0 12px",
      background: "var(--background-secondary-a-enabled)",
      border: `1px solid ${focused ? "var(--border-secondary-hover)" : "transparent"}`,
      borderRadius: "var(--radius-pill)",
      transition: "background .15s, border-color .15s",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 18,
    color: "var(--content-tertiary-enabled)"
  }), /*#__PURE__*/React.createElement("input", _extends({
    value: val,
    placeholder: placeholder,
    onChange: e => {
      setInner(e.target.value);
      onChange && onChange(e);
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-family-base)",
      fontSize: size === "sm" ? 13 : 14,
      color: "var(--content-primary-a-enabled)"
    }
  }, rest)), val && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C",
    onClick: () => {
      setInner("");
      onClear && onClear();
    },
    style: {
      display: "flex",
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 16,
    color: "var(--content-tertiary-enabled)"
  })));
}
Object.assign(__ds_scope, { Search });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Search.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
/** TN dropdown select — mirrors <TNSelector>. */
function Select({
  label,
  value,
  placeholder = "Выберите",
  options = [],
  size = "md",
  error,
  disabled = false,
  onChange,
  style
}) {
  const [open, setOpen] = React.useState(false);
  const [inner, setInner] = React.useState(value);
  const current = value !== undefined ? value : inner;
  const selected = options.find(o => (o.id ?? o.value ?? o) === current);
  const h = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const ref = React.useRef(null);
  React.useEffect(() => {
    const close = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const label_ = o => typeof o === "object" ? o.title ?? o.label : o;
  const id_ = o => typeof o === "object" ? o.id ?? o.value : o;
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      position: "relative",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--content-secondary-enabled)"
    }
  }, label), /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: disabled,
    onClick: () => setOpen(o => !o),
    style: {
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
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, selected ? label_(selected) : placeholder), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 18,
    color: "var(--content-tertiary-enabled)",
    style: {
      transform: open ? "rotate(180deg)" : "none",
      transition: "transform .15s"
    }
  })), open && /*#__PURE__*/React.createElement("div", {
    style: {
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
      overflowY: "auto"
    }
  }, options.map((o, i) => {
    const oid = id_(o);
    const isSel = oid === current;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      onClick: () => {
        setInner(oid);
        onChange && onChange(oid, o);
        setOpen(false);
      },
      style: {
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
        textAlign: "left"
      },
      onMouseEnter: e => {
        if (!isSel) e.currentTarget.style.background = "var(--background-secondary-a-enabled)";
      },
      onMouseLeave: e => {
        if (!isSel) e.currentTarget.style.background = "transparent";
      }
    }, label_(o), isSel && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 16,
      color: "var(--content-accent-enabled)"
    }));
  })), error && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      color: "var(--content-system-negative)"
    }
  }, error));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** TN switch — mirrors <TNTumbler>. */
function Switch({
  checked,
  defaultChecked = false,
  label,
  size = "md",
  disabled = false,
  onChange,
  style
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked !== undefined ? checked : inner;
  const w = size === "sm" ? 32 : 40;
  const h = size === "sm" ? 18 : 24;
  const knob = h - 6;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => {
      if (disabled) return;
      const v = !on;
      setInner(v);
      onChange && onChange(v);
    },
    style: {
      position: "relative",
      width: w,
      height: h,
      flex: "0 0 auto",
      background: on ? "var(--background-accent-enabled)" : "var(--neutral-30)",
      borderRadius: "var(--radius-pill)",
      transition: "background .18s ease"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      left: on ? w - knob - 3 : 3,
      width: knob,
      height: knob,
      background: "var(--neutral-white)",
      borderRadius: "var(--radius-pill)",
      boxShadow: "0 1px 2px rgba(30,34,40,.3)",
      transition: "left .18s ease"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-body)",
      color: "var(--content-primary-a-enabled)"
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** TN multiline text field — mirrors <TNTextarea>. */
function Textarea({
  label,
  value,
  defaultValue,
  placeholder,
  rows = 4,
  error,
  hint,
  disabled = false,
  resize = "vertical",
  style,
  onChange,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = disabled ? "var(--border-secondary-disabled)" : error ? "var(--border-accent-enabled)" : focused ? "var(--border-primary-a-enabled)" : "var(--border-secondary-enabled)";
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--content-secondary-enabled)"
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    rows: rows,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      background: disabled ? "var(--background-secondary-a-disabled)" : "var(--background-primary-a-enabled)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focused && !error ? "var(--focus-ring)" : "none",
      font: "var(--font-family-base)",
      fontSize: 14,
      lineHeight: "20px",
      color: "var(--content-primary-a-enabled)",
      resize,
      outline: "none",
      transition: "border-color .15s, box-shadow .15s"
    }
  }, rest)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      color: error ? "var(--content-system-negative)" : "var(--content-tertiary-enabled)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumbs.jsx
try { (() => {
/** TN breadcrumbs — mirrors <TNBreadcrumbs>. */
function Breadcrumbs({
  items = [],
  onNavigate,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 4,
      ...style
    }
  }, items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      onClick: () => !last && onNavigate && onNavigate(it, i),
      style: {
        font: "var(--text-body)",
        fontWeight: last ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
        color: last ? "var(--content-primary-a-enabled)" : "var(--content-secondary-enabled)",
        cursor: last ? "default" : "pointer",
        whiteSpace: "nowrap"
      }
    }, it.text), !last && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevron-right",
      size: 16,
      color: "var(--content-tertiary-enabled)"
    }));
  }));
}
Object.assign(__ds_scope, { Breadcrumbs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumbs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/** TN tabs — mirrors <TNTabs>. */
function Tabs({
  options = [],
  value,
  variant = "underline",
  size = "md",
  onChange,
  style
}) {
  const [inner, setInner] = React.useState(value ?? options[0]?.id);
  const active = value !== undefined ? value : inner;
  const select = id => {
    setInner(id);
    onChange && onChange(id);
  };
  const segmented = variant === "segmented";
  const fs = size === "sm" ? 13 : 14;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      gap: segmented ? 2 : 4,
      padding: segmented ? 3 : 0,
      background: segmented ? "var(--background-secondary-a-enabled)" : "transparent",
      borderRadius: segmented ? "var(--radius-md)" : 0,
      borderBottom: segmented ? "none" : "1px solid var(--border-secondary-enabled)",
      ...style
    }
  }, options.map(o => {
    const isActive = o.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      type: "button",
      disabled: o.disabled,
      onClick: () => !o.disabled && select(o.id),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: segmented ? 30 : size === "sm" ? 34 : 40,
        padding: segmented ? "0 14px" : "0 4px",
        marginBottom: segmented ? 0 : -1,
        border: "none",
        background: segmented && isActive ? "var(--background-primary-a-enabled)" : "transparent",
        borderRadius: segmented ? "var(--radius-sm)" : 0,
        borderBottom: segmented ? "none" : `2px solid ${isActive ? "var(--background-accent-enabled)" : "transparent"}`,
        boxShadow: segmented && isActive ? "var(--shadow-small)" : "none",
        font: "var(--font-family-base)",
        fontSize: fs,
        fontWeight: "var(--font-weight-semibold)",
        color: isActive ? "var(--content-primary-a-enabled)" : "var(--content-secondary-enabled)",
        cursor: o.disabled ? "not-allowed" : "pointer",
        opacity: o.disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        transition: "color .12s"
      }
    }, o.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: o.icon,
      size: size === "sm" ? 16 : 18,
      color: isActive ? "var(--content-accent-enabled)" : "var(--content-tertiary-enabled)"
    }), o.name, o.secondaryText != null && /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--text-caption)",
        color: "var(--content-tertiary-enabled)",
        fontWeight: "var(--font-weight-medium)"
      }
    }, o.secondaryText));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/AdminDashboard.jsx
try { (() => {
// Аудитор UI kit — admin dashboard (по роли): здоровье базы, типы, горячие точки,
// неактивные владельцы, веса критичности.
const {
  Icon,
  Card,
  Tag,
  Button,
  Avatar
} = window.TNDesignSystem_7f9df2;
function HealthRing({
  value
}) {
  const r = 52,
    c = 2 * Math.PI * r;
  const tone = value >= 80 ? "var(--content-system-positive)" : value >= 60 ? "var(--content-system-warning)" : "var(--content-system-negative)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 132,
      height: 132,
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "132",
    height: "132",
    viewBox: "0 0 132 132"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "66",
    cy: "66",
    r: r,
    fill: "none",
    stroke: "var(--background-tertiary-enabled)",
    strokeWidth: "11"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "66",
    cy: "66",
    r: r,
    fill: "none",
    stroke: tone,
    strokeWidth: "11",
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: c * (1 - value / 100),
    transform: "rotate(-90 66 66)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 34,
      fontWeight: 800,
      color: "var(--content-primary-a-enabled)",
      lineHeight: 1
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: "var(--content-tertiary-enabled)",
      marginTop: 2
    }
  }, "\u0438\u0437 100")));
}
function TypeCounter({
  icon,
  label,
  count
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 14px",
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-sm)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    color: "var(--content-secondary-enabled)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13,
      color: "var(--content-secondary-enabled)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: "var(--content-primary-a-enabled)"
    }
  }, count));
}
function SectionTitle({
  icon,
  children,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    color: "var(--content-accent-enabled)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)"
    }
  }, children), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), right);
}
function AdminDashboard({
  onBack
}) {
  const {
    DASHBOARD,
    PTYPE
  } = window.AUDITOR_DATA;
  const d = DASHBOARD;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      background: "var(--neutral-10)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 880,
      margin: "0 auto",
      padding: "24px 24px 56px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: "purple",
    size: "md",
    icon: "shield"
  }, "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0443 \u0431\u0430\u0437\u044B \u0437\u043D\u0430\u043D\u0438\u0439"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "white",
    icon: "arrow-left",
    onClick: onBack
  }, "\u041A \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "300px 1fr",
      gap: 16,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    icon: "activity"
  }, "\u0418\u043D\u0434\u0435\u043A\u0441 \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u044F"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(HealthRing, {
    value: d.health
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: "green",
    size: "md",
    icon: "trending-up"
  }, "+", d.trend, " \u0437\u0430 \u043C\u0435\u0441\u044F\u0446"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--content-tertiary-enabled)",
      maxWidth: 130
    }
  }, "\u0421\u043D\u0438\u0436\u0430\u044E\u0442 \u0434\u0443\u0431\u043B\u044C \u0432 \u043A\u0430\u0434\u0440\u0430\u0445 \u0438 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u0440\u0435\u0447\u0438\u0435 \u043F\u043E \u0421\u0418\u0417")))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    icon: "list-checks"
  }, "\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u043F\u043E \u0442\u0438\u043F\u0430\u043C"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(TypeCounter, {
    icon: PTYPE.contradiction.icon,
    label: "\u041F\u0440\u043E\u0442\u0438\u0432\u043E\u0440\u0435\u0447\u0438\u044F",
    count: d.totals.contradiction
  }), /*#__PURE__*/React.createElement(TypeCounter, {
    icon: PTYPE.duplicate.icon,
    label: "\u0414\u0443\u0431\u043B\u0438",
    count: d.totals.duplicate
  }), /*#__PURE__*/React.createElement(TypeCounter, {
    icon: PTYPE.broken.icon,
    label: "\u0411\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
    count: d.totals.broken
  }), /*#__PURE__*/React.createElement(TypeCounter, {
    icon: PTYPE.ownerless.icon,
    label: "\u0411\u0435\u0437 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0430",
    count: d.totals.ownerless
  })))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    icon: "flame"
  }, "\u0413\u043E\u0440\u044F\u0447\u0438\u0435 \u0442\u043E\u0447\u043A\u0438 \u043F\u043E \u043F\u043E\u0434\u0440\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u044F\u043C"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, d.hotspots.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 130,
      fontSize: 13.5,
      color: "var(--content-primary-a-enabled)",
      fontWeight: 500
    }
  }, h.dept), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 10,
      background: "var(--background-tertiary-enabled)",
      borderRadius: "999px",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${h.share}%`,
      height: "100%",
      background: i === 0 ? "var(--red-60)" : "var(--red-40)",
      borderRadius: "999px"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      textAlign: "right",
      fontSize: 13.5,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)"
    }
  }, h.count))))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    icon: "git-compare"
  }, "\u041A\u0430\u0440\u0442\u0430 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u0440\u0435\u0447\u0438\u0439 \u043C\u0435\u0436\u0434\u0443 \u043F\u043E\u0434\u0440\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u044F\u043C\u0438"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, d.contradictionMap.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)"
    }
  }, m.a), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 26,
      height: 26,
      background: "var(--red-10)",
      borderRadius: "var(--radius-pill)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left-right",
    size: 14,
    color: "var(--content-accent-enabled)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)"
    }
  }, m.b)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      color: "var(--content-secondary-enabled)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, m.topic), /*#__PURE__*/React.createElement(Tag, {
    tone: m.tone,
    size: "sm"
  }, m.level))))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    icon: "user-x"
  }, "\u0412\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u044B: \u0434\u0430\u0432\u043D\u043E \u043D\u0435 \u0437\u0430\u0445\u043E\u0434\u0438\u043B\u0438"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 150px 70px 130px",
      gap: 12,
      padding: "0 4px 8px",
      fontSize: 11.5,
      fontWeight: 600,
      color: "var(--content-tertiary-enabled)",
      textTransform: "uppercase",
      letterSpacing: ".03em",
      borderBottom: "1px solid var(--border-secondary-enabled)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u0412\u043B\u0430\u0434\u0435\u043B\u0435\u0446"), /*#__PURE__*/React.createElement("span", null, "\u041F\u043E\u0434\u0440\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u0435"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, "\u0421\u0442\u0430\u0442\u0435\u0439"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, "\u041F\u043E\u0441\u043B\u0435\u0434. \u0432\u0445\u043E\u0434")), d.inactiveOwners.map((o, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 150px 70px 130px",
      gap: 12,
      alignItems: "center",
      padding: "10px 4px",
      borderBottom: i < d.inactiveOwners.length - 1 ? "1px solid var(--border-secondary-enabled)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    text: o.initials,
    size: "sm",
    status: o.inactive ? "red" : "gray"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)"
    }
  }, o.name), o.inactive && /*#__PURE__*/React.createElement(Tag, {
    tone: "red",
    size: "sm"
  }, "\u043D\u0435\u0430\u043A\u0442\u0438\u0432\u0435\u043D")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--content-secondary-enabled)"
    }
  }, o.dept), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--content-secondary-enabled)",
      textAlign: "right"
    }
  }, o.pages), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: o.inactive ? "var(--content-system-negative)" : "var(--content-secondary-enabled)",
      textAlign: "right",
      fontWeight: o.inactive ? 600 : 400
    }
  }, o.lastLogin))))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    icon: "sliders-horizontal",
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "link",
      icon: "pencil"
    }, "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C")
  }, "\u0423\u0440\u043E\u0432\u043D\u0438 \u043A\u0440\u0438\u0442\u0438\u0447\u043D\u043E\u0441\u0442\u0438 \u043F\u043E \u0440\u0430\u0437\u0434\u0435\u043B\u0430\u043C"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, d.weights.map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 120
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: w.tone,
    size: "md"
  }, w.level)), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 16,
    color: "var(--content-tertiary-enabled)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      color: "var(--content-secondary-enabled)"
    }
  }, w.scope)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 14,
      paddingTop: 14,
      borderTop: "1px solid var(--border-secondary-enabled)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "eye",
    size: 17,
    color: "var(--content-secondary-enabled)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      color: "var(--content-primary-a-enabled)",
      fontWeight: 500
    }
  }, "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u044B \u043F\u0440\u0438 \u043E\u0446\u0435\u043D\u043A\u0435 \u043E\u0445\u0432\u0430\u0442\u0430"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--content-tertiary-enabled)"
    }
  }, "\u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E")))));
}
Object.assign(window, {
  AdminDashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/AdminDashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/AgentLanding.jsx
try { (() => {
// Аудитор UI kit — лендинг агента: приветствие + композер + список вопросов.
// Воспроизводит экран «ИИ-ассистент» один-в-один; переиспользуется Аудитором.
const {
  Icon
} = window.TNDesignSystem_7f9df2;
function Composer({
  value,
  onChange,
  onSubmit,
  placeholder
}) {
  const [focus, setFocus] = React.useState(false);
  const has = value.trim().length > 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 10,
      height: 60,
      padding: "0 16px",
      background: "#fff",
      border: `1px solid ${focus ? "var(--border-primary-a-enabled)" : "var(--border-secondary-enabled)"}`,
      borderRadius: "var(--radius-xl)",
      boxShadow: focus ? "var(--shadow-small)" : "none",
      transition: "border-color .15s, box-shadow .15s"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 22,
    color: "var(--content-secondary-enabled)"
  }), /*#__PURE__*/React.createElement("input", {
    value: value,
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    onChange: e => onChange(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    },
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-family-base)",
      fontSize: 16,
      color: "var(--content-primary-a-enabled)"
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "mic",
    size: 22,
    color: "var(--content-secondary-enabled)"
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C",
    onClick: onSubmit,
    disabled: !has,
    style: {
      width: 48,
      height: 48,
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      borderRadius: "var(--radius-lg)",
      cursor: has ? "pointer" : "default",
      background: has ? "var(--background-accent-enabled)" : "var(--background-secondary-a-enabled)",
      transition: "background .15s"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 22,
    color: has ? "#fff" : "var(--content-tertiary-enabled)"
  })));
}
function SuggestionRow({
  item,
  onClick,
  last
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onClick(item),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      padding: "16px 8px",
      border: "none",
      borderBottom: last ? "none" : "1px solid var(--border-secondary-enabled)",
      cursor: "pointer",
      textAlign: "left",
      background: hover ? "var(--background-primary-a-hover)" : "transparent",
      transition: "background .12s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 15,
      color: "var(--content-primary-a-enabled)"
    }
  }, item.text), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 20,
    color: hover ? "var(--content-accent-enabled)" : "var(--content-tertiary-enabled)"
  }));
}
function AgentLanding({
  config,
  onSubmit
}) {
  const [text, setText] = React.useState("");
  const submit = val => {
    const q = (val ?? text).trim();
    if (q) onSubmit(q);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 940,
      margin: "0 auto",
      padding: "64px 40px 48px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 30
    }
  }, config.heading), /*#__PURE__*/React.createElement(Composer, {
    value: text,
    onChange: setText,
    onSubmit: () => submit(),
    placeholder: config.placeholder
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)",
      padding: "0 8px 2px"
    }
  }, config.suggestLabel), /*#__PURE__*/React.createElement("div", null, config.suggestions.map((s, i) => /*#__PURE__*/React.createElement(SuggestionRow, {
    key: s.id,
    item: s,
    last: i === config.suggestions.length - 1,
    onClick: it => submit(it.text)
  }))))));
}
Object.assign(window, {
  AgentLanding
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/AgentLanding.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/AuditorReport.jsx
try { (() => {
// Аудитор UI kit — report screen + per-type evidence + share dialog.
const {
  Icon,
  Card,
  Tag,
  Button,
  Avatar,
  Dialog,
  Input,
  Search
} = window.TNDesignSystem_7f9df2;

// ---- affected page link row ----
function PageLink({
  page,
  dead
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 10px",
      width: "100%",
      textAlign: "left",
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-md)",
      background: "#fff",
      cursor: "pointer"
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = "var(--neutral-10)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = "#fff";
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: dead ? "file-x" : "file-text",
    size: 17,
    color: dead ? "var(--content-system-negative)" : "var(--content-tertiary-enabled)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, page.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11.5,
      color: "var(--content-tertiary-enabled)"
    }
  }, page.path)), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 15,
    color: "var(--content-tertiary-enabled)"
  }));
}

// ---- Масштабируемый список затронутых статей (десятки–сотни) ----
function AffectedPages({
  pages,
  label = "Затронутые статьи"
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [q, setQ] = React.useState("");
  const many = pages.length > 4;
  const filtered = q ? pages.filter(p => (p.title + " " + p.path).toLowerCase().includes(q.toLowerCase())) : pages;
  const shown = expanded ? filtered : pages.slice(0, 4);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: "var(--content-tertiary-enabled)",
      textTransform: "uppercase",
      letterSpacing: ".03em"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 20,
      height: 18,
      padding: "0 6px",
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-pill)",
      fontSize: 11.5,
      fontWeight: 700,
      color: "var(--content-secondary-enabled)"
    }
  }, pages.length), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), many && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setExpanded(v => !v),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--content-accent-enabled)",
      padding: 0
    }
  }, expanded ? "Свернуть" : `Показать все ${pages.length}`, /*#__PURE__*/React.createElement(Icon, {
    name: expanded ? "chevron-up" : "chevron-down",
    size: 14,
    color: "var(--content-accent-enabled)"
  }))), expanded && pages.length > 8 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Search, {
    placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0441\u0442\u0430\u0442\u044C\u044F\u043C",
    size: "sm",
    value: q,
    onChange: e => setQ(e.target.value),
    onClear: () => setQ("")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      maxHeight: expanded ? 260 : "none",
      overflowY: expanded ? "auto" : "visible",
      paddingRight: expanded ? 4 : 0
    }
  }, shown.map((p, i) => /*#__PURE__*/React.createElement(PageLink, {
    key: i,
    page: p,
    dead: p.dead
  })), expanded && filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--content-tertiary-enabled)",
      padding: "8px 2px"
    }
  }, "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E")), !expanded && many && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setExpanded(true),
    style: {
      marginTop: 6,
      width: "100%",
      padding: "8px 10px",
      border: "1px dashed var(--border-secondary-hover)",
      borderRadius: "var(--radius-md)",
      background: "transparent",
      cursor: "pointer",
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--content-secondary-enabled)"
    }
  }, "+ \u0435\u0449\u0451 ", pages.length - 4, " ", pages.length - 4 === 1 ? "статья" : "статей"));
}

// ---- Один конкретный конфликт (пара/группа формулировок) ----
function ConflictItem({
  conflict,
  index
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      background: "var(--background-secondary-a-enabled)",
      borderBottom: "1px solid var(--border-secondary-enabled)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      background: "var(--red-10)",
      borderRadius: "var(--radius-pill)",
      fontSize: 11.5,
      fontWeight: 700,
      color: "var(--content-accent-enabled)"
    }
  }, index), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)"
    }
  }, conflict.topic)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr"
    }
  }, conflict.sides.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: 12,
      borderLeft: i === 1 ? "1px solid var(--border-secondary-enabled)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 14,
    color: "var(--content-tertiary-enabled)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      fontSize: 12,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, s.article)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: "19px",
      color: "var(--neutral-85)",
      padding: "8px 10px",
      background: "var(--red-5)",
      borderLeft: "2px solid var(--red-40)",
      borderRadius: "4px",
      marginBottom: 6
    }
  }, "\xAB", s.fragment, "\xBB"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontSize: 11,
      color: "var(--content-tertiary-enabled)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 11,
    color: "var(--content-tertiary-enabled)"
  }), s.path, " \xB7 ", s.updated)))));
}
function ConflictList({
  conflicts
}) {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? conflicts : conflicts.slice(0, 2);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: "var(--content-tertiary-enabled)",
      textTransform: "uppercase",
      letterSpacing: ".03em"
    }
  }, "\u041D\u0430\u0439\u0434\u0435\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u0440\u0435\u0447\u0438\u044F"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 20,
      height: 18,
      padding: "0 6px",
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-pill)",
      fontSize: 11.5,
      fontWeight: 700,
      color: "var(--content-secondary-enabled)"
    }
  }, conflicts.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, shown.map((c, i) => /*#__PURE__*/React.createElement(ConflictItem, {
    key: c.id || i,
    conflict: c,
    index: i + 1
  }))), conflicts.length > 2 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setExpanded(v => !v),
    style: {
      marginTop: 8,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--content-accent-enabled)",
      padding: 0
    }
  }, expanded ? "Свернуть" : `Показать ещё ${conflicts.length - 2}`, /*#__PURE__*/React.createElement(Icon, {
    name: expanded ? "chevron-up" : "chevron-down",
    size: 14,
    color: "var(--content-accent-enabled)"
  })));
}

// ---- evidence: duplicate (группа похожих статей) ----
function SimilarityBar({
  value
}) {
  const tone = value >= 90 ? "var(--content-system-negative)" : value >= 80 ? "var(--content-system-warning)" : "var(--yellow-50)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flex: "0 0 120px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 6,
      background: "var(--background-tertiary-enabled)",
      borderRadius: "999px",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${value}%`,
      height: "100%",
      background: tone,
      borderRadius: "999px"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)",
      width: 38,
      textAlign: "right"
    }
  }, value, "%"));
}
function EvidenceDuplicate({
  ev
}) {
  const [expanded, setExpanded] = React.useState(false);
  const arts = ev.articles;
  const shown = expanded ? arts : arts.slice(0, 3);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, ev.overlap && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 12px",
      background: "var(--orange-10)",
      borderLeft: "2px solid var(--content-system-warning)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "copy",
    size: 14,
    color: "var(--orange-65)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      color: "var(--orange-65)",
      textTransform: "uppercase",
      letterSpacing: ".03em"
    }
  }, "\u041F\u043E\u0432\u0442\u043E\u0440\u044F\u044E\u0449\u0438\u0439\u0441\u044F \u0444\u0440\u0430\u0433\u043C\u0435\u043D\u0442")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: "19px",
      color: "var(--neutral-85)"
    }
  }, "\xAB", ev.overlap, "\xBB")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: "var(--content-tertiary-enabled)",
      textTransform: "uppercase",
      letterSpacing: ".03em"
    }
  }, "\u041F\u043E\u0445\u043E\u0436\u0438\u0435 \u0441\u0442\u0430\u0442\u044C\u0438"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 20,
      height: 18,
      padding: "0 6px",
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-pill)",
      fontSize: 11.5,
      fontWeight: 700,
      color: "var(--content-secondary-enabled)"
    }
  }, arts.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, shown.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 10px",
      textAlign: "left",
      width: "100%",
      border: `1px solid ${p.primary ? "var(--border-primary-a-enabled)" : "var(--border-secondary-enabled)"}`,
      borderRadius: "var(--radius-md)",
      background: "#fff",
      cursor: "pointer"
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = "var(--neutral-10)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = "#fff";
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 17,
    color: "var(--content-tertiary-enabled)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, p.title), p.primary && /*#__PURE__*/React.createElement(Tag, {
    tone: "green",
    size: "sm"
  }, "\u044D\u0442\u0430\u043B\u043E\u043D")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11.5,
      color: "var(--content-tertiary-enabled)",
      marginTop: 1
    }
  }, p.path, " \xB7 ", p.updated)), /*#__PURE__*/React.createElement(SimilarityBar, {
    value: p.similarity
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 15,
    color: "var(--content-tertiary-enabled)"
  })))), arts.length > 3 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setExpanded(v => !v),
    style: {
      marginTop: 8,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--content-accent-enabled)",
      padding: 0
    }
  }, expanded ? "Свернуть" : `Показать ещё ${arts.length - 3}`, /*#__PURE__*/React.createElement(Icon, {
    name: expanded ? "chevron-up" : "chevron-down",
    size: 14,
    color: "var(--content-accent-enabled)"
  }))));
}

// ---- источники одной ссылки (где встречается) ----
function LinkSources({
  sources
}) {
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded ? sources : sources.slice(0, 2);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: "var(--content-tertiary-enabled)",
      marginBottom: 6
    }
  }, "\u0412\u0441\u0442\u0440\u0435\u0447\u0430\u0435\u0442\u0441\u044F \u0432 ", sources.length, " ", sources.length === 1 ? "статье" : "статьях"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, shown.map((s, i) => /*#__PURE__*/React.createElement(PageLink, {
    key: i,
    page: s
  }))), sources.length > 2 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setExpanded(v => !v),
    style: {
      marginTop: 6,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--content-accent-enabled)",
      padding: 0
    }
  }, expanded ? "Свернуть" : `Показать ещё ${sources.length - 2}`, /*#__PURE__*/React.createElement(Icon, {
    name: expanded ? "chevron-up" : "chevron-down",
    size: 14,
    color: "var(--content-accent-enabled)"
  })));
}

// ---- evidence: broken links (группа мёртвых ссылок) ----
function EvidenceBroken({
  ev
}) {
  const links = ev.links;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: "var(--content-tertiary-enabled)",
      textTransform: "uppercase",
      letterSpacing: ".03em"
    }
  }, "\u041C\u0451\u0440\u0442\u0432\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 20,
      height: 18,
      padding: "0 6px",
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-pill)",
      fontSize: 11.5,
      fontWeight: 700,
      color: "var(--content-secondary-enabled)"
    }
  }, links.length)), links.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 12px",
      background: "var(--red-5)",
      borderBottom: "1px solid var(--border-secondary-enabled)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "unlink",
    size: 16,
    color: "var(--content-system-negative)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)"
    }
  }, l.target), /*#__PURE__*/React.createElement(Tag, {
    tone: "red",
    size: "sm"
  }, l.status)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      paddingLeft: 24
    }
  }, /*#__PURE__*/React.createElement("code", {
    style: {
      fontFamily: "var(--font-family-mono)",
      fontSize: 12,
      color: "var(--content-system-negative)",
      textDecoration: "line-through"
    }
  }, l.url), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--content-tertiary-enabled)"
    }
  }, "\xB7 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E ", l.checked))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12
    }
  }, /*#__PURE__*/React.createElement(LinkSources, {
    sources: l.sources
  })))));
}

// ---- evidence: ownerless ----
function EvidenceOwnerless({
  ev
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(PageLink, {
    page: ev.page
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 10px",
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-md)",
      background: "var(--background-secondary-a-enabled)"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    text: ev.owner.initials,
    size: "sm",
    status: "gray"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)"
    }
  }, ev.owner.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11.5,
      color: "var(--content-tertiary-enabled)"
    }
  }, "\u0432\u043B\u0430\u0434\u0435\u043B\u0435\u0446 \u0441\u0442\u0430\u0442\u044C\u0438")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12.5,
      color: "var(--content-system-negative)",
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user-x",
    size: 15,
    color: "var(--content-system-negative)"
  }), "\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0432\u0445\u043E\u0434 ", ev.owner.lastLogin, " \xB7 ", ev.owner.ago)));
}
function Evidence({
  finding
}) {
  if (finding.type === "duplicate") return /*#__PURE__*/React.createElement(EvidenceDuplicate, {
    ev: finding.evidence
  });
  if (finding.type === "broken") return /*#__PURE__*/React.createElement(EvidenceBroken, {
    ev: finding.evidence
  });
  if (finding.type === "ownerless") return /*#__PURE__*/React.createElement(EvidenceOwnerless, {
    ev: finding.evidence
  });
  return null;
}
function ProblemCard({
  finding
}) {
  const {
    SEVERITY,
    PTYPE
  } = window.AUDITOR_DATA;
  const sev = SEVERITY[finding.severity];
  const t = PTYPE[finding.type];
  const isContradiction = finding.type === "contradiction";
  return /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: sev.tone,
    size: "md"
  }, sev.label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: 28,
      padding: "0 10px",
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-sm)",
      fontSize: 13,
      fontWeight: 500,
      color: "var(--content-secondary-enabled)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 15,
    color: "var(--content-secondary-enabled)"
  }), t.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)",
      lineHeight: "22px"
    }
  }, finding.title), isContradiction ? /*#__PURE__*/React.createElement(ConflictList, {
    conflicts: finding.conflicts
  }) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: "var(--content-tertiary-enabled)",
      textTransform: "uppercase",
      letterSpacing: ".03em",
      marginBottom: 8
    }
  }, "\u0414\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E"), /*#__PURE__*/React.createElement(Evidence, {
    finding: finding
  })), isContradiction && /*#__PURE__*/React.createElement(AffectedPages, {
    pages: finding.pages
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 7,
      padding: "8px 10px",
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 15,
    color: "var(--content-tertiary-enabled)",
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      lineHeight: "17px",
      color: "var(--content-secondary-enabled)"
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--content-primary-a-enabled)"
    }
  }, "\u041E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u0435:"), " ", finding.basis))));
}
function SummaryChips({
  findings
}) {
  const {
    PTYPE,
    pluralRu
  } = window.AUDITOR_DATA;
  const byType = {};
  findings.forEach(f => {
    byType[f.type] = (byType[f.type] || 0) + 1;
  });
  const order = ["contradiction", "duplicate", "broken", "ownerless"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, order.filter(k => byType[k]).map(k => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: 30,
      padding: "0 12px",
      background: "#fff",
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-pill)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--content-primary-a-enabled)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: PTYPE[k].icon,
    size: 15,
    color: "var(--content-secondary-enabled)"
  }), byType[k], " ", pluralRu(byType[k], PTYPE[k].forms))));
}
function ShareDialog({
  open,
  onClose
}) {
  const [copied, setCopied] = React.useState(false);
  if (!open) return null;
  return /*#__PURE__*/React.createElement(Dialog, {
    title: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F \u043E\u0442\u0447\u0451\u0442\u043E\u043C",
    width: 440,
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "\u0413\u043E\u0442\u043E\u0432\u043E"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 20,
    color: "var(--content-system-positive)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      lineHeight: "18px",
      color: "var(--content-secondary-enabled)"
    }
  }, "\u0421\u0441\u044B\u043B\u043A\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u0430. \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430\u043C \u0422\u0435\u0445\u043D\u043E\u041D\u0418\u041A\u041E\u041B\u044C \u043F\u043E\u0441\u043B\u0435 \u0432\u0445\u043E\u0434\u0430 \u2014 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044C \u0432\u0438\u0434\u0438\u0442 \u043E\u0442\u0447\u0451\u0442 \u0432 \u043F\u0440\u0435\u0434\u0435\u043B\u0430\u0445 \u0441\u0432\u043E\u0438\u0445 \u043F\u0440\u0430\u0432 \u0434\u043E\u0441\u0442\u0443\u043F\u0430.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043E\u0442\u0447\u0451\u0442",
    value: "https://app.tn.ru/kb/auditor/r/8f3ac1",
    readOnly: true,
    icon: "link"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: copied ? "secondary" : "accent",
    icon: copied ? "check" : "copy",
    onClick: () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    },
    style: {
      marginBottom: 0
    }
  }, copied ? "Готово" : "Копировать"))));
}
function TypeTile({
  typeKey,
  findings,
  active,
  onClick
}) {
  const {
    PTYPE,
    SEVERITY
  } = window.AUDITOR_DATA;
  const t = PTYPE[typeKey];
  const items = findings.filter(f => f.type === typeKey);
  const count = items.length;
  const worst = items.reduce((acc, f) => SEVERITY[f.severity].order < acc ? SEVERITY[f.severity].order : acc, 9);
  const worstKey = Object.keys(SEVERITY).find(k => SEVERITY[k].order === worst);
  const tone = count ? SEVERITY[worstKey].tone : "neutral";
  const toneColor = {
    red: "var(--content-system-negative)",
    orange: "var(--content-system-warning)",
    yellow: "var(--yellow-50)",
    neutral: "var(--content-tertiary-enabled)"
  }[tone];
  const toneBg = {
    red: "var(--red-10)",
    orange: "var(--orange-10)",
    yellow: "var(--yellow-10)",
    neutral: "var(--background-secondary-a-enabled)"
  }[tone];
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onClick(typeKey),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: 16,
      textAlign: "left",
      cursor: "pointer",
      background: "#fff",
      border: `1.5px solid ${active ? "var(--border-primary-a-enabled)" : "var(--border-secondary-enabled)"}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: active || hover ? "var(--shadow-small)" : "none",
      transition: "border-color .15s, box-shadow .15s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: toneBg,
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 21,
    color: toneColor
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 30,
      fontWeight: 800,
      color: "var(--content-primary-a-enabled)",
      lineHeight: 1
    }
  }, count)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)"
    }
  }, t.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--content-secondary-enabled)",
      marginTop: 2
    }
  }, t.desc)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: "auto",
      paddingTop: 6,
      borderTop: "1px solid var(--border-secondary-enabled)"
    }
  }, count ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12.5,
      fontWeight: 600,
      color: toneColor
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "999px",
      background: toneColor
    }
  }), "\u0434\u043E \xAB", SEVERITY[worstKey].label.toLowerCase(), "\xBB") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--content-tertiary-enabled)"
    }
  }, "\u043D\u0435\u0442 \u043F\u0440\u043E\u0431\u043B\u0435\u043C"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 12.5,
      fontWeight: 600,
      color: active ? "var(--content-accent-enabled)" : "var(--content-tertiary-enabled)"
    }
  }, "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 14,
    color: active ? "var(--content-accent-enabled)" : "var(--content-tertiary-enabled)"
  }))));
}
function AuditorReport({
  query,
  onNewQuery,
  onDashboard
}) {
  const {
    FINDINGS,
    SEVERITY,
    PTYPE,
    pluralRu
  } = window.AUDITOR_DATA;
  const [share, setShare] = React.useState(false);
  const [filter, setFilter] = React.useState(null); // null = все
  const listRef = React.useRef(null);
  const sorted = [...FINDINGS].sort((a, b) => SEVERITY[a.severity].order - SEVERITY[b.severity].order);
  const visible = filter ? sorted.filter(f => f.type === filter) : sorted;
  const order = ["contradiction", "duplicate", "broken", "ownerless"];
  const pickType = typeKey => {
    setFilter(cur => cur === typeKey ? null : typeKey);
    setTimeout(() => {
      const el = listRef.current;
      if (!el) return;
      let sc = el.parentElement;
      while (sc && sc.scrollHeight <= sc.clientHeight) sc = sc.parentElement;
      if (sc) sc.scrollTo({
        top: sc.scrollTop + el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 12,
        behavior: "smooth"
      });
    }, 60);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      background: "var(--neutral-10)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: "0 auto",
      padding: "24px 24px 56px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--red-10)",
      borderRadius: "var(--radius-pill)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 18,
    color: "var(--content-accent-enabled)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)"
    }
  }, query), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--content-tertiary-enabled)",
      marginTop: 2
    }
  }, "\u041D\u0430\u0439\u0434\u0435\u043D\u043E 10 \u0441\u0442\u0430\u0442\u0435\u0439")), /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    icon: "arrow-left",
    onClick: onNewQuery
  }, "\u041D\u043E\u0432\u044B\u0439 \u0437\u0430\u043F\u0440\u043E\u0441")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)"
    }
  }, "\u0418\u0442\u043E\u0433\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: "var(--content-secondary-enabled)"
    }
  }, "\xB7 ", FINDINGS.length, " ", pluralRu(FINDINGS.length, ["проблема", "проблемы", "проблем"]), " \u0432 7 \u0441\u0442\u0430\u0442\u044C\u044F\u0445"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), onDashboard && /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    icon: "gauge",
    onClick: onDashboard
  }, "\u0414\u0430\u0448\u0431\u043E\u0440\u0434 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 24
    }
  }, order.map(k => /*#__PURE__*/React.createElement(TypeTile, {
    key: k,
    typeKey: k,
    findings: FINDINGS,
    active: filter === k,
    onClick: pickType
  }))), /*#__PURE__*/React.createElement("div", {
    ref: listRef,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
      scrollMarginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)"
    }
  }, filter ? PTYPE[filter].title : "Все проблемы"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 22,
      height: 22,
      padding: "0 7px",
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-pill)",
      fontSize: 12.5,
      fontWeight: 700,
      color: "var(--content-secondary-enabled)"
    }
  }, visible.length), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), filter && /*#__PURE__*/React.createElement(Button, {
    variant: "white",
    size: "sm",
    icon: "x",
    onClick: () => setFilter(null)
  }, "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0441\u0435"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    icon: "share-2",
    onClick: () => setShare(true)
  }, "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, visible.map(f => /*#__PURE__*/React.createElement(ProblemCard, {
    key: f.id,
    finding: f
  })))), /*#__PURE__*/React.createElement(ShareDialog, {
    open: share,
    onClose: () => setShare(false)
  }));
}
Object.assign(window, {
  AuditorReport
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/AuditorReport.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/Sidebar.jsx
try { (() => {
// Аудитор UI kit — узкий рейл супераппа + панель-дерево агента «ИИ-ассистент».
// Состав и подложки воспроизводят реальный экран один-в-один.
const {
  Icon,
  Avatar,
  Badge
} = window.TNDesignSystem_7f9df2;

// ---------- Узкий рейл иконок ----------
function RailBtn({
  icon,
  title,
  badge,
  dot,
  color,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: title,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      width: 48,
      height: 48,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      borderRadius: "var(--radius-lg)",
      cursor: "pointer",
      background: hover ? "var(--neutral-10)" : "transparent"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 24,
    color: color || "var(--neutral-55)"
  }), badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      right: 2
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    count: badge,
    max: 9
  })), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 9,
      right: 11,
      width: 7,
      height: 7,
      borderRadius: "999px",
      background: "var(--red-60)",
      border: "1.5px solid #fff"
    }
  }));
}
function Rail() {
  const {
    CURRENT_USER
  } = window.AUDITOR_DATA;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 88,
      flex: "0 0 88px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "14px 0 12px",
      gap: 6,
      background: "transparent"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: "\u041F\u043E\u0438\u0441\u043A",
    style: {
      width: 52,
      height: 52,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      background: "var(--background-secondary-a-enabled)",
      borderRadius: "var(--radius-xl)",
      cursor: "pointer",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 22,
    color: "var(--neutral-60)"
  })), /*#__PURE__*/React.createElement(RailBtn, {
    icon: "layout-grid",
    title: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F"
  }), /*#__PURE__*/React.createElement(RailBtn, {
    icon: "messages-square",
    title: "\u0427\u0430\u0442\u044B",
    badge: 12
  }), /*#__PURE__*/React.createElement(RailBtn, {
    icon: "users",
    title: "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438"
  }), /*#__PURE__*/React.createElement(RailBtn, {
    icon: "users-round",
    title: "\u041A\u043E\u043C\u0430\u043D\u0434\u044B"
  }), /*#__PURE__*/React.createElement(RailBtn, {
    icon: "video",
    title: "\u0412\u0438\u0434\u0435\u043E\u0432\u0441\u0442\u0440\u0435\u0447\u0438"
  }), /*#__PURE__*/React.createElement(RailBtn, {
    icon: "panels-top-left",
    title: "\u0414\u043E\u0441\u043A\u0438"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(RailBtn, {
    icon: "wallet",
    title: "\u041A\u043E\u0448\u0435\u043B\u0451\u043A",
    color: "var(--red-65)",
    dot: true
  }), /*#__PURE__*/React.createElement(RailBtn, {
    icon: "ellipsis",
    title: "\u0415\u0449\u0451"
  }), /*#__PURE__*/React.createElement(RailBtn, {
    icon: "circle-help",
    title: "\u041F\u043E\u043C\u043E\u0449\u044C"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "999px",
      background: "var(--red-60)",
      margin: "4px 0",
      flex: "0 0 auto"
    },
    title: "\u0422\u0435\u0445\u043D\u043E\u041D\u0418\u041A\u041E\u041B\u044C"
  }), /*#__PURE__*/React.createElement(Avatar, {
    text: CURRENT_USER.initials,
    size: "md"
  }));
}

// ---------- Панель-дерево ----------
function NavRow({
  item,
  active,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  const selectable = !item.group;
  const on = active;
  const depthPad = 12 + item.depth * 20;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: selectable ? onClick : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: "100%",
      padding: "10px 12px",
      paddingLeft: depthPad,
      border: "none",
      borderRadius: "var(--radius-md)",
      textAlign: "left",
      cursor: selectable ? "pointer" : "default",
      background: on ? "var(--background-secondary-a-enabled)" : hover && selectable ? "var(--neutral-10)" : "transparent",
      transition: "background .12s"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: item.icon,
    size: item.depth >= 2 ? 18 : 19,
    color: on ? "var(--content-primary-a-enabled)" : "var(--content-tertiary-enabled)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: 14,
      fontWeight: on ? 600 : item.depth >= 2 ? 400 : 500,
      color: on ? "var(--content-primary-a-enabled)" : item.depth >= 2 ? "var(--content-tertiary-enabled)" : "var(--content-secondary-enabled)"
    }
  }, item.label), item.badge != null && /*#__PURE__*/React.createElement(Badge, {
    count: item.badge
  }));
}
function AgentPanel({
  active = "new",
  onSelect
}) {
  const {
    KB_MODES
  } = window.AUDITOR_DATA;
  const auditorBadge = (KB_MODES.find(m => m.id === "auditor") || {}).badge;
  const nav = [{
    id: "new",
    icon: "message-circle",
    label: "Новый чат",
    depth: 0
  }, {
    id: "projects",
    icon: "folder-plus",
    label: "Проекты",
    depth: 0
  }, {
    id: "agents",
    icon: "star",
    label: "Агенты",
    depth: 0,
    group: true
  }, {
    id: "kb",
    icon: "megaphone",
    label: "База знаний",
    depth: 1,
    group: true
  }, {
    id: "assistant",
    icon: "sparkles",
    label: "Ассистент",
    depth: 2
  }, {
    id: "auditor",
    icon: "shield-check",
    label: "Аудитор",
    depth: 2,
    badge: auditorBadge
  }, {
    id: "recognition",
    icon: "scan-text",
    label: "Распознавание док...",
    depth: 2
  }, {
    id: "chats",
    icon: "messages-square",
    label: "Чаты",
    depth: 0,
    group: true
  }, {
    id: "chat1",
    icon: "star",
    label: "Генеральный дирек...",
    depth: 1
  }, {
    id: "chat2",
    icon: "star",
    label: "Генеральный дирек...",
    depth: 1
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 330,
      flex: "0 0 330px",
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      borderRight: "1px solid var(--border-secondary-enabled)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "18px 18px 16px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "panel-left-close",
    size: 22,
    color: "var(--content-tertiary-enabled)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: "var(--content-tertiary-enabled)"
    }
  }, "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--border-secondary-enabled)",
      margin: "0 18px 10px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "0 10px 10px",
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, nav.map(item => /*#__PURE__*/React.createElement(NavRow, {
    key: item.id,
    item: item,
    active: active === item.id,
    onClick: () => onSelect && onSelect(item.id)
  }))));
}
Object.assign(window, {
  Rail,
  AgentPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/Topbar.jsx
try { (() => {
// Аудитор UI kit — хедер карточки: «ИИ-ассистент» слева, «···» и «✕» справа.
const {
  Icon
} = window.TNDesignSystem_7f9df2;
function HeaderBtn({
  icon,
  title,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: title,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: 40,
      height: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      borderRadius: "var(--radius-md)",
      cursor: "pointer",
      background: hover ? "var(--neutral-20)" : "var(--background-secondary-a-enabled)",
      transition: "background .12s"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20,
    color: "var(--neutral-55)"
  }));
}
function Topbar({
  title = "ИИ-ассистент"
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 72,
      flex: "0 0 72px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 16px 0 24px",
      background: "#fff",
      borderBottom: "1px solid var(--neutral-15)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-family-base)",
      fontSize: 20,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(HeaderBtn, {
    icon: "ellipsis",
    title: "\u0415\u0449\u0451"
  }), /*#__PURE__*/React.createElement(HeaderBtn, {
    icon: "x",
    title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
  }));
}
Object.assign(window, {
  Topbar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/Topbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/app.jsx
try { (() => {
// Аудитор UI kit — root orchestration.
// Modes: assistant (existing Q&A, shown for the nested switch) / auditor.
// Auditor flow: landing → scanning → report. Admin: dashboard (by role).
const {
  Icon,
  Button,
  EmptyContent
} = window.TNDesignSystem_7f9df2;
const IS_ADMIN = true; // Виктория — администратор базы знаний

const SCAN_STEPS = ["Индексация статей раздела", "Поиск дублей и пересечений", "Сверка противоречий между статьями", "Проверка ссылок и владельцев"];
function Scanning({
  query,
  onDone
}) {
  const [step, setStep] = React.useState(0);
  const [pct, setPct] = React.useState(6);
  React.useEffect(() => {
    const t1 = setInterval(() => setPct(p => Math.min(100, p + 4)), 80);
    const t2 = setInterval(() => setStep(s => Math.min(SCAN_STEPS.length - 1, s + 1)), 620);
    const done = setTimeout(onDone, 2700);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearTimeout(done);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--neutral-10)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 460,
      background: "#fff",
      border: "1px solid var(--border-secondary-enabled)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-large)",
      padding: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--red-10)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 24,
    color: "var(--content-accent-enabled)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)"
    }
  }, "\u0418\u0434\u0451\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--content-tertiary-enabled)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: 360
    }
  }, query))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: "var(--background-tertiary-enabled)",
      borderRadius: "999px",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: "100%",
      background: "var(--background-accent-enabled)",
      borderRadius: "999px",
      transition: "width .2s linear"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginTop: 18
    }
  }, SCAN_STEPS.map((s, i) => {
    const done = i < step,
      cur = i === step;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "999px",
        background: done ? "var(--green-10)" : cur ? "var(--red-10)" : "var(--background-secondary-a-enabled)"
      }
    }, done ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 14,
      color: "var(--content-system-positive)"
    }) : cur ? /*#__PURE__*/React.createElement(Icon, {
      name: "loader-circle",
      size: 14,
      color: "var(--content-accent-enabled)",
      style: {
        animation: "tn-spin .7s linear infinite"
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "999px",
        background: "var(--neutral-35)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: done || cur ? "var(--content-primary-a-enabled)" : "var(--content-tertiary-enabled)"
      }
    }, s));
  }))), /*#__PURE__*/React.createElement("style", null, `@keyframes tn-spin{to{transform:rotate(360deg)}}`));
}
const AUDITOR_CFG = {
  placeholder: "Проверьте тему или раздел…",
  suggestLabel: "С чего начать",
  suggestions: window.AUDITOR_DATA.SUGGESTIONS_AUDITOR,
  heading: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)",
      lineHeight: "26px"
    }
  }, "\u0410\u0443\u0434\u0438\u0442\u043E\u0440 \u0431\u0430\u0437\u044B \u0437\u043D\u0430\u043D\u0438\u0439"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)",
      lineHeight: "26px"
    }
  }, "\u041D\u0430\u0439\u0434\u0443 \u0434\u0443\u0431\u043B\u0438, \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u0440\u0435\u0447\u0438\u044F \u0438 \u0431\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438 \u2014 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--content-accent-enabled)"
    }
  }, "\u0447\u0442\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u043C?")))
};
const ASSISTANT_CFG = {
  placeholder: "Спросите что-нибудь...",
  suggestLabel: "Часто задаваемые вопросы",
  suggestions: window.AUDITOR_DATA.SUGGESTIONS_ASSISTANT,
  heading: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)",
      lineHeight: "26px"
    }
  }, "\u041F\u0440\u0438\u0432\u0435\u0442, ", window.AUDITOR_DATA.CURRENT_USER.name, "!"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 700,
      color: "var(--content-primary-a-enabled)",
      lineHeight: "26px"
    }
  }, "\u042F \u0442\u0432\u043E\u0439 \u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442 \u2014 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--content-accent-enabled)"
    }
  }, "\u0422\u0438\u043D\u0438"), ", \u0447\u0435\u043C \u043C\u043E\u0433\u0443 \u043F\u043E\u043C\u043E\u0447\u044C?"))
};
function App() {
  const [nav, setNav] = React.useState("new"); // выбранный пункт дерева
  const [view, setView] = React.useState("landing"); // landing | scanning | report | dashboard (для Аудитора)
  const [query, setQuery] = React.useState("");
  const runAudit = q => {
    setQuery(q);
    setView("scanning");
  };
  const onSelect = id => {
    setNav(id);
    if (id === "auditor") {
      setView("landing");
    }
  };

  // Что показывать в контентной области.
  let content;
  if (nav === "auditor") {
    if (view === "dashboard") content = /*#__PURE__*/React.createElement(AdminDashboard, {
      onBack: () => setView("landing")
    });else if (view === "landing") content = /*#__PURE__*/React.createElement(AgentLanding, {
      config: AUDITOR_CFG,
      onSubmit: runAudit
    });else if (view === "scanning") content = /*#__PURE__*/React.createElement(Scanning, {
      query: query,
      onDone: () => setView("report")
    });else content = /*#__PURE__*/React.createElement(AuditorReport, {
      query: query,
      onNewQuery: () => setView("landing"),
      onDashboard: IS_ADMIN ? () => setView("dashboard") : null
    });
  } else if (nav === "new" || nav === "assistant") {
    content = /*#__PURE__*/React.createElement(AgentLanding, {
      config: ASSISTANT_CFG,
      onSubmit: () => {}
    });
  } else {
    content = /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff"
      }
    }, /*#__PURE__*/React.createElement(EmptyContent, {
      icon: "hammer",
      title: "\u0420\u0430\u0437\u0434\u0435\u043B \u0432 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0435",
      description: "\u042D\u0442\u043E\u0442 \u043F\u0443\u043D\u043A\u0442 \u043C\u0435\u043D\u044E \u2014 \u0447\u0430\u0441\u0442\u044C \u0441\u0443\u043F\u0435\u0440\u0430\u043F\u043F\u0430 \u0438 \u0432 \u043F\u0440\u043E\u0442\u043E\u0442\u0438\u043F\u0435 \u043D\u0435 \u043D\u0430\u043F\u043E\u043B\u043D\u0435\u043D."
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "#fff",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      flex: "0 0 3px",
      background: "var(--blue-20)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(Rail, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      margin: "14px 16px 16px 4px",
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
      boxShadow: "var(--shadow-small)",
      border: "1px solid var(--border-secondary-enabled)"
    }
  }, /*#__PURE__*/React.createElement(Topbar, {
    title: "\u0418\u0418-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(AgentPanel, {
    active: nav,
    onSelect: onSelect
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, content)))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auditor/data.js
try { (() => {
// Аудитор UI kit — данные демо-базы (demo_seed_knowledge_base.json).
// Аудитор проверяет САМУ базу знаний: противоречия, дубли, битые ссылки,
// статьи без активного владельца. Подсвечивает — решает человек.
// Текущая дата прототипа — 12.06.2026.

// ---------- Superapp left rail ----------
const TN_AGENTS = [{
  id: "home",
  icon: "house",
  label: "Главная"
}, {
  id: "tasks",
  icon: "square-check-big",
  label: "Задачи"
}, {
  id: "kb",
  icon: "book-open",
  label: "База знаний"
}, {
  id: "docs",
  icon: "folder",
  label: "Документы"
}, {
  id: "people",
  icon: "users",
  label: "Сотрудники"
}, {
  id: "analytics",
  icon: "chart-no-axes-column",
  label: "Аналитика"
}];

// Текущий пользователь — администратор базы знаний.
const CURRENT_USER = {
  name: "Виктория",
  initials: "ВК"
};

// ---------- «База знаний» agent — nested modes ----------
const KB_MODES = [{
  id: "assistant",
  icon: "message-circle",
  label: "Ассистент",
  caption: "Вопрос-ответ по базе"
}, {
  id: "auditor",
  icon: "shield-check",
  label: "Аудитор",
  caption: "Проверка качества базы",
  badge: 5
}];
const KB_EXTRA = [{
  id: "sources",
  icon: "library",
  label: "Статьи базы",
  count: 10
}, {
  id: "history",
  icon: "history",
  label: "История проверок"
}];

// ---------- Severity → semantic palette (никаких новых цветов) ----------
const SEVERITY = {
  critical: {
    label: "Критическая",
    short: "критич.",
    tone: "red",
    order: 1
  },
  high: {
    label: "Высокая",
    short: "высокая",
    tone: "orange",
    order: 2
  },
  medium: {
    label: "Средняя",
    short: "средняя",
    tone: "yellow",
    order: 3
  },
  low: {
    label: "Низкая",
    short: "низкая",
    tone: "neutral",
    order: 4
  }
};

// ---------- Problem types (+ формы для склонения) ----------
const PTYPE = {
  contradiction: {
    label: "Противоречие",
    title: "Противоречия",
    icon: "git-compare",
    forms: ["противоречие", "противоречия", "противоречий"],
    desc: "Статьи расходятся в данных"
  },
  duplicate: {
    label: "Дубль",
    title: "Дубли",
    icon: "copy",
    forms: ["дубль", "дубля", "дублей"],
    desc: "Повторяют одно и то же"
  },
  broken: {
    label: "Битая ссылка",
    title: "Битые ссылки",
    icon: "unlink",
    forms: ["битая ссылка", "битые ссылки", "битых ссылок"],
    desc: "Ведут на удалённые страницы"
  },
  ownerless: {
    label: "Нет владельца",
    title: "Неактивные владельцы",
    icon: "user-x",
    forms: ["неактивный владелец", "неактивных владельца", "неактивных владельцев"],
    desc: "Некому поддерживать статью"
  }
};

// Русское склонение по числу.
function pluralRu(n, forms) {
  const m10 = n % 10,
    m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return forms[1];
  return forms[2];
}

// ---------- Landing suggestions ----------
const SUGGESTIONS_AUDITOR = [{
  id: "s1",
  icon: "refresh-cw",
  text: "Проверь актуальность кадровых процессов"
}, {
  id: "s2",
  icon: "copy",
  text: "Найди дубли в кадровых статьях"
}, {
  id: "s3",
  icon: "git-compare",
  text: "Покажи противоречия по охране труда и СИЗ"
}, {
  id: "s4",
  icon: "user-x",
  text: "Статьи без активного владельца"
}];
const SUGGESTIONS_ASSISTANT = [{
  id: "q1",
  icon: "arrow-right",
  text: "Как подать заявку на отпуск?"
}, {
  id: "q2",
  icon: "arrow-right",
  text: "Как подать заявку на ДМС?"
}, {
  id: "q3",
  icon: "arrow-right",
  text: "Как оформить авансовый отчет?"
}, {
  id: "q4",
  icon: "arrow-right",
  text: "Как оформить командировку?"
}, {
  id: "q5",
  icon: "arrow-right",
  text: "Сколько дней отпуска осталось?"
}];

// Генератор затронутых статей (для демонстрации масштаба в сотни статей).
function buildPages(n, prefix, sections) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const sec = sections[i % sections.length];
    out.push({
      title: `${prefix} № ${i}`,
      path: sec
    });
  }
  return out;
}

// ---------- Audit findings (из демо-базы) ----------
const FINDINGS = [{
  id: "f1",
  type: "contradiction",
  severity: "critical",
  title: "Нормы выдачи СИЗ расходятся между подразделениями",
  basis: "Статьи ссылаются на разные редакции корпоративного стандарта СИЗ (2021 против 2025). Тема безопасности — критический уровень; расхождение видно на карте противоречий между подразделениями.",
  conflicts: [{
    id: "c1",
    topic: "Периодичность выдачи спецодежды",
    sides: [{
      article: "Инструктаж по охране труда на строительной площадке",
      path: "Охрана труда / Инструктажи · kb-010",
      updated: "05.10.2025",
      fragment: "Спецодежда выдаётся по нормам стандарта 2021 года — один раз в 12 месяцев."
    }, {
      article: "Обеспечение работников средствами защиты (СИЗ)",
      path: "Закупки / Снабжение · kb-011",
      updated: "01.12.2025",
      fragment: "По стандарту 2025 года спецодежда выдаётся один раз в 24 месяца с учётом износа."
    }]
  }, {
    id: "c2",
    topic: "Замена СИЗ при досрочном износе",
    sides: [{
      article: "Инструктаж по охране труда на строительной площадке",
      path: "Охрана труда / Инструктажи · kb-010",
      updated: "05.10.2025",
      fragment: "Досрочная замена — только по акту комиссии при полном износе."
    }, {
      article: "Обеспечение работников средствами защиты (СИЗ)",
      path: "Закупки / Снабжение · kb-011",
      updated: "01.12.2025",
      fragment: "Замена производится по заявке мастера без созыва комиссии."
    }]
  }, {
    id: "c3",
    topic: "Кто финансирует закупку",
    sides: [{
      article: "Инструктаж по охране труда на строительной площадке",
      path: "Охрана труда / Инструктажи · kb-010",
      updated: "05.10.2025",
      fragment: "Закупка СИЗ — за счёт фонда охраны труда подразделения."
    }, {
      article: "Обеспечение работников средствами защиты (СИЗ)",
      path: "Закупки / Снабжение · kb-011",
      updated: "01.12.2025",
      fragment: "Финансирование централизовано через службу снабжения."
    }]
  }],
  pages: [{
    title: "Инструктаж по охране труда на строительной площадке",
    path: "Охрана труда / Инструктажи · kb-010"
  }, {
    title: "Обеспечение работников средствами защиты (СИЗ)",
    path: "Закупки / Снабжение · kb-011"
  }, ...buildPages(245, "Карта выдачи СИЗ — объект", ["Охрана труда / Карты СИЗ", "Производство / Цеха", "Логистика / Склады", "Строительство / Участки"])]
}, {
  id: "f2",
  type: "contradiction",
  severity: "high",
  title: "Расходятся суточные и срок авансового отчёта",
  basis: "Числовые нормы не совпадают: суточные 1500 ₽ против 700 ₽, срок отчёта 3 против 5 рабочих дней. Статья kb-004 заметно старее (обновлена в 2022).",
  conflicts: [{
    id: "c1",
    topic: "Размер суточных по России",
    sides: [{
      article: "Оформление служебной командировки",
      path: "Персонал / Командировки · kb-003",
      updated: "30.09.2025",
      fragment: "Суточные по России — 1500 ₽ в день."
    }, {
      article: "Командировочные расходы и авансовый отчёт",
      path: "Персонал / Командировки · kb-004",
      updated: "14.03.2022",
      fragment: "Суточные — 700 ₽ за день."
    }]
  }, {
    id: "c2",
    topic: "Срок сдачи авансового отчёта",
    sides: [{
      article: "Оформление служебной командировки",
      path: "Персонал / Командировки · kb-003",
      updated: "30.09.2025",
      fragment: "Авансовый отчёт — в течение 3 рабочих дней."
    }, {
      article: "Командировочные расходы и авансовый отчёт",
      path: "Персонал / Командировки · kb-004",
      updated: "14.03.2022",
      fragment: "Авансовый отчёт — в течение 5 рабочих дней."
    }]
  }],
  pages: [{
    title: "Оформление служебной командировки",
    path: "Персонал / Командировки · kb-003"
  }, {
    title: "Командировочные расходы и авансовый отчёт",
    path: "Персонал / Командировки · kb-004"
  }, {
    title: "Памятка командированному сотруднику",
    path: "Персонал / Памятки"
  }, {
    title: "Лимиты расходов в командировке",
    path: "Финансы / Лимиты"
  }]
}, {
  id: "f3",
  type: "broken",
  severity: "high",
  title: "Мёртвые ссылки на удалённые страницы базы",
  basis: "Целевые страницы вернули 404 при последней индексации (12.06.2026). Ссылки нужно обновить или убрать — иначе сотрудник упирается в пустую страницу.",
  evidence: {
    links: [{
      target: "Список клиник по ДМС",
      url: "/kb/kb-099",
      status: "Страница удалена · 404",
      checked: "12.06.2026",
      sources: [{
        title: "Оформление полиса ДМС",
        path: "Персонал / Льготы / ДМС · kb-005"
      }, {
        title: "Памятка по добровольному медстрахованию",
        path: "Персонал / Памятки"
      }, {
        title: "Соцпакет: что входит",
        path: "Персонал / Льготы"
      }]
    }, {
      target: "Бланк заявления на командировку (2023)",
      url: "/files/forms/komandirovka-2023.docx",
      status: "Файл не найден · 404",
      checked: "12.06.2026",
      sources: [{
        title: "Оформление служебной командировки",
        path: "Персонал / Командировки · kb-003"
      }]
    }]
  }
}, {
  id: "f4",
  type: "duplicate",
  severity: "medium",
  title: "Процесс оформления отпуска дублируется в нескольких статьях",
  basis: "Высокое текстовое сходство абзацев: статьи описывают одно и то же — подачу заявки за 14 дней, согласование руководителем и издание приказа кадровой службой. Рекомендуется свести в одну статью-эталон, остальные сделать ссылками.",
  evidence: {
    overlap: "Заявление на отпуск подаётся не менее чем за 14 календарных дней, согласуется непосредственным руководителем, после чего кадровая служба издаёт приказ.",
    articles: [{
      title: "Порядок предоставления ежегодного отпуска",
      path: "Персонал / Кадровые процессы / Отпуск",
      updated: "04.02.2025",
      similarity: 100,
      primary: true
    }, {
      title: "Как подать заявку на отпуск",
      path: "Персонал / Отпуск",
      updated: "12.11.2024",
      similarity: 91
    }, {
      title: "Памятка сотруднику: ежегодный отпуск",
      path: "Персонал / Памятки",
      updated: "19.11.2023",
      similarity: 84
    }, {
      title: "Отпуск: пошаговая инструкция",
      path: "Адаптация / Новичкам",
      updated: "03.07.2024",
      similarity: 76
    }]
  }
}, {
  id: "f5",
  type: "ownerless",
  severity: "medium",
  title: "У статьи об онбординге нет активного владельца",
  basis: "Владелец не заходил в систему более 12 месяцев — у статьи нет живого хозяина, обновлять её некому.",
  pages: [{
    title: "Адаптация и онбординг новых сотрудников",
    path: "Персонал / Онбординг"
  }],
  evidence: {
    page: {
      title: "Адаптация и онбординг новых сотрудников",
      path: "Персонал / Кадровые процессы / Онбординг",
      updated: "30.08.2023"
    },
    owner: {
      name: "Игорь Петров",
      initials: "ИП",
      lastLogin: "30.08.2023",
      ago: "более 12 месяцев назад"
    }
  }
}];

// Default report (full-base scan).
const REPORT = {
  query: "Проверь всю базу знаний",
  scope: "Вся база · 10 статей",
  checked: 10,
  clean: 2
};

// ---------- Admin dashboard ----------
const DASHBOARD = {
  health: 64,
  trend: +5,
  totals: {
    contradiction: 2,
    duplicate: 1,
    broken: 1,
    ownerless: 1
  },
  hotspots: [{
    dept: "Персонал",
    count: 6,
    share: 100
  }, {
    dept: "Охрана труда",
    count: 1,
    share: 17
  }, {
    dept: "Закупки",
    count: 1,
    share: 17
  }, {
    dept: "PR",
    count: 0,
    share: 0
  }],
  contradictionMap: [{
    a: "Охрана труда",
    b: "Закупки",
    topic: "Нормы выдачи СИЗ — стандарт 2021 vs 2025",
    tone: "red",
    level: "Критическая"
  }],
  inactiveOwners: [{
    name: "Игорь Петров",
    initials: "ИП",
    dept: "Персонал",
    pages: 1,
    lastLogin: "30.08.2023",
    inactive: true
  }, {
    name: "Ольга Морозова",
    initials: "ОМ",
    dept: "Охрана труда",
    pages: 1,
    lastLogin: "10.12.2025",
    inactive: false
  }, {
    name: "Кирилл Орлов",
    initials: "КО",
    dept: "PR",
    pages: 1,
    lastLogin: "20.02.2026",
    inactive: false
  }],
  weights: [{
    level: "Критическая",
    tone: "red",
    scope: "Охрана труда, Безопасность"
  }, {
    level: "Высокая",
    tone: "orange",
    scope: "Персонал, Закупки, Финансы"
  }, {
    level: "Средняя",
    tone: "yellow",
    scope: "Адаптация, PR, ИТ"
  }, {
    level: "Низкая",
    tone: "neutral",
    scope: "Прочие разделы"
  }]
};
window.AUDITOR_DATA = {
  TN_AGENTS,
  CURRENT_USER,
  KB_MODES,
  KB_EXTRA,
  SEVERITY,
  PTYPE,
  pluralRu,
  SUGGESTIONS_AUDITOR,
  SUGGESTIONS_ASSISTANT,
  FINDINGS,
  REPORT,
  DASHBOARD
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auditor/data.js", error: String((e && e.message) || e) }); }

// ui_kits/snow/build/Projects.jsx
try { (() => {
const PrIcon = window.__lazyTN("Icon"), PrButton = window.__lazyTN("Button"), PrTag = window.__lazyTN("Tag"), PrSearch = window.__lazyTN("Search"), PrAvatar = window.__lazyTN("Avatar");
const PR_COLS = "minmax(0,2.1fr) 1.15fr 1fr 0.8fr 0.7fr 0.95fr 36px";
const PR_MONTHS = { "\u044F\u043D\u0432\u0430\u0440\u044F": 0, "\u0444\u0435\u0432\u0440\u0430\u043B\u044F": 1, "\u043C\u0430\u0440\u0442\u0430": 2, "\u0430\u043F\u0440\u0435\u043B\u044F": 3, "\u043C\u0430\u044F": 4, "\u0438\u044E\u043D\u044F": 5, "\u0438\u044E\u043B\u044F": 6, "\u0430\u0432\u0433\u0443\u0441\u0442\u0430": 7, "\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F": 8, "\u043E\u043A\u0442\u044F\u0431\u0440\u044F": 9, "\u043D\u043E\u044F\u0431\u0440\u044F": 10, "\u0434\u0435\u043A\u0430\u0431\u0440\u044F": 11 };
function prDate(s) {
  const m = String(s).split(" ");
  return new Date(+m[2] || 0, PR_MONTHS[m[1]] || 0, +m[0] || 1).getTime();
}
function ProjectsView({ onOpen, onNew }) {
  const D = window.SNOW_DATA;
  const rows = [...D.PROJECTS].sort((a, b) => prDate(b.created) - prDate(a.created));
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", background: "var(--neutral-10)" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 1180, margin: "0 auto", padding: "32px 40px 48px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 24 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, fontWeight: 800, color: "var(--content-primary-a-enabled)", letterSpacing: "-0.01em" } }, "\u041F\u0440\u043E\u0435\u043A\u0442\u044B"), /* @__PURE__ */ React.createElement("p", { style: { margin: "6px 0 0", fontSize: 14, color: "var(--content-tertiary-enabled)" } }, "\u041F\u0440\u043E\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0438\u0441\u0442\u0435\u043C \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u0430 \u0441\u043D\u0435\u0433\u043E\u0432\u043E\u0439 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043D\u0430 \u043F\u043B\u043E\u0441\u043A\u0438\u0445 \u043A\u0440\u043E\u0432\u043B\u044F\u0445")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("div", { style: { width: 280 } }, /* @__PURE__ */ React.createElement(PrSearch, { placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u0430\u043C", size: "lg" })), /* @__PURE__ */ React.createElement(PrButton, { variant: "accent", icon: "plus", size: "lg", rounded: true, onClick: onNew }, "\u041D\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u0435\u043A\u0442")), /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-lg)", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "14px 22px", borderBottom: "1px solid var(--border-secondary-enabled)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, "\u0412\u0441\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "var(--content-tertiary-enabled)", marginLeft: 8 } }, "\xB7 ", D.PROJECTS.length)), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: PR_COLS, alignItems: "center", padding: "10px 22px", borderBottom: "1px solid var(--neutral-15)", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", color: "var(--content-tertiary-enabled)", textTransform: "uppercase" } }, /* @__PURE__ */ React.createElement("span", null, "\u041E\u0431\u044A\u0435\u043A\u0442"), /* @__PURE__ */ React.createElement("span", null, "\u2116 \u043E\u0431\u044A\u0435\u043A\u0442\u0430"), /* @__PURE__ */ React.createElement("span", null, "\u0413\u043E\u0440\u043E\u0434"), /* @__PURE__ */ React.createElement("span", null, "\u041F\u043B\u043E\u0449\u0430\u0434\u044C"), /* @__PURE__ */ React.createElement("span", null, "\u0414\u0430\u0442\u0447\u0438\u043A\u0438"), /* @__PURE__ */ React.createElement("span", null, "\u0421\u0442\u0430\u0442\u0443\u0441"), /* @__PURE__ */ React.createElement("span", null)), rows.map((p, i) => /* @__PURE__ */ React.createElement(ProjectRow, { key: i, p, onOpen })))));
}
function PrInfo({ k, v, mono }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)", marginBottom: 2 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 600, color: "var(--content-primary-a-enabled)", fontFamily: mono ? "var(--font-family-mono, monospace)" : "inherit" } }, v));
}
function ProjectRow({ p, onOpen }) {
  const D = window.SNOW_DATA;
  const [h, setH] = React.useState(false);
  const [open, setOpen] = React.useState(!!p.current);
  const history = p.current ? D.CALC_HISTORY : null;
  return /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "1px solid var(--neutral-15)" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setOpen((v) => !v),
      onMouseEnter: () => setH(true),
      onMouseLeave: () => setH(false),
      style: { width: "100%", textAlign: "left", border: "none", cursor: "pointer", background: h || open ? "var(--neutral-10)" : "#fff", display: "grid", gridTemplateColumns: PR_COLS, alignItems: "center", padding: "16px 22px", transition: "background .12s" }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 13, minWidth: 0 } }, /* @__PURE__ */ React.createElement(PrAvatar, { icon: "building-2", square: true, size: "md", color: "var(--blue-10)" }), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, fontWeight: 600, color: "var(--content-primary-a-enabled)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, p.name), p.current && /* @__PURE__ */ React.createElement(PrTag, { tone: "red", size: "sm" }, "\u0442\u0435\u043A\u0443\u0449\u0438\u0439")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--content-tertiary-enabled)", marginTop: 2 } }, "\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F: ", p.created, " \xB7 \u0440\u0430\u0441\u0447\u0451\u0442\u043E\u0432: ", p.calcs))),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontFamily: "var(--font-family-mono, monospace)", color: "var(--content-secondary-enabled)" } }, p.number),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: "var(--content-secondary-enabled)" } }, p.city),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: "var(--content-secondary-enabled)" } }, p.area, " \u043C\xB2"),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: "var(--content-secondary-enabled)" } }, p.sensors || "\u2014"),
    /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(PrTag, { tone: p.tone, size: "md" }, p.status)),
    /* @__PURE__ */ React.createElement("span", { style: { display: "flex", justifyContent: "flex-end", transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" } }, /* @__PURE__ */ React.createElement(PrIcon, { name: "chevron-right", size: 18, color: "var(--neutral-40)" }))
  ), open && /* @__PURE__ */ React.createElement("div", { style: { padding: "4px 22px 20px 75px", background: "var(--neutral-10)" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-lg)", padding: "18px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, "\u041E \u0440\u0430\u0441\u0447\u0451\u0442\u0435"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(PrButton, { variant: "accent", icon: "arrow-right", size: "sm", onClick: () => onOpen(p) }, "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0440\u0430\u0441\u0447\u0451\u0442")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 16px", marginBottom: history ? 16 : 0 } }, /* @__PURE__ */ React.createElement(PrInfo, { k: "\u041E\u0431\u044A\u0435\u043A\u0442", v: p.name }), /* @__PURE__ */ React.createElement(PrInfo, { k: "\u2116 \u043E\u0431\u044A\u0435\u043A\u0442\u0430 (\u041A\u0418\u0421\u041E)", v: p.number, mono: true }), /* @__PURE__ */ React.createElement(PrInfo, { k: "\u0413\u043E\u0440\u043E\u0434", v: p.city }), /* @__PURE__ */ React.createElement(PrInfo, { k: "\u041D\u043E\u043C\u0435\u0440 \u0440\u0430\u0441\u0447\u0451\u0442\u0430", v: p.calcNo, mono: true }), /* @__PURE__ */ React.createElement(PrInfo, { k: "\u0417\u0430\u043A\u0430\u0437\u0447\u0438\u043A \u0440\u0430\u0441\u0447\u0451\u0442\u0430", v: p.customer }), /* @__PURE__ */ React.createElement(PrInfo, { k: "\u0412\u0441\u0435\u0433\u043E \u0440\u0430\u0441\u0447\u0451\u0442\u043E\u0432", v: `${p.calcs} \u0448\u0442.` })), history && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 600, color: "var(--content-tertiary-enabled)", marginBottom: 8 } }, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0440\u0430\u0441\u0447\u0451\u0442\u043E\u0432 \u043E\u0431\u044A\u0435\u043A\u0442\u0430 \xB7 ", history.length), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, history.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px solid ${c.current ? "var(--red-60)" : "var(--border-secondary-enabled)"}`, borderRadius: "var(--radius-md)", background: c.current ? "var(--red-10)" : "#fff" } }, /* @__PURE__ */ React.createElement(PrIcon, { name: "file-text", size: 16, color: "var(--content-tertiary-enabled)" }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" } }, c.no, c.current ? " \xB7 \u0442\u0435\u043A\u0443\u0449\u0438\u0439" : ""), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, c.date, " \xB7 ", c.author)), /* @__PURE__ */ React.createElement(PrTag, { tone: c.tone, size: "sm" }, c.status))))))));
}
Object.assign(window, { ProjectsView, PrInfo });

}); }

// ui_kits/snow/build/Result.jsx
try { (() => {
const SR = window.__lazyNS();
function ResultView({ onExport }) {
  const D = window.SNOW_DATA, M = D.METRICS;
  const [view, setView] = React.useState("2d");
  const [showShare, setShowShare] = React.useState(false);
  const P = D.PROJECT;
  return /* @__PURE__ */ React.createElement(
    window.WorkArea,
    {
      panelWidth: 400,
      canvas: /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "#fff", borderBottom: "1px solid var(--border-secondary-enabled)" } }, /* @__PURE__ */ React.createElement(
        SR.Tabs,
        {
          variant: "segmented",
          value: view,
          options: [{ id: "2d", name: "2D-\u0441\u0445\u0435\u043C\u0430", icon: "map" }, { id: "3d", name: "3D-\u043A\u0430\u0440\u0442\u0430 \u0441\u043D\u0435\u0433\u0430", icon: "box" }],
          onChange: setView
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--content-tertiary-enabled)" } }, D.PROJECT.norm)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, position: "relative", minHeight: 0 } }, /* @__PURE__ */ React.createElement(
        window.RoofCanvas,
        {
          view3d: view === "3d",
          layers: { geometry: true, parapet: true, obstacles: true, walkway: view === "2d", bags: true, sensors: true, dims: view === "2d", north: true }
        }
      ), /* @__PURE__ */ React.createElement(Legend, null), view === "3d" && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.92)", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", padding: "8px 12px", fontSize: 12, color: "var(--content-secondary-enabled)" } }, "\u0412\u044B\u0441\u043E\u0442\u0430 \u0441\u043D\u0435\u0436\u043D\u043E\u0433\u043E \u043F\u043E\u043A\u0440\u043E\u0432\u0430 \u2014 \u0430\u043D\u0430\u043B\u043E\u0433 \u0442\u0435\u043F\u043B\u043E\u0432\u043E\u0439 \u043A\u0430\u0440\u0442\u044B"))),
      panel: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", minHeight: 0, height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto" } }, /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u041E \u0440\u0430\u0441\u0447\u0451\u0442\u0435" }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 20px 6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" } }, /* @__PURE__ */ React.createElement(InfoRow, { k: "\u041E\u0431\u044A\u0435\u043A\u0442", v: P.name }), /* @__PURE__ */ React.createElement(InfoRow, { k: "\u2116 \u043E\u0431\u044A\u0435\u043A\u0442\u0430 (\u041A\u0418\u0421\u041E)", v: P.number, mono: true }), /* @__PURE__ */ React.createElement(InfoRow, { k: "\u041D\u043E\u043C\u0435\u0440 \u0440\u0430\u0441\u0447\u0451\u0442\u0430", v: P.calcNo, mono: true }), /* @__PURE__ */ React.createElement(InfoRow, { k: "\u0417\u0430\u043A\u0430\u0437\u0447\u0438\u043A \u0440\u0430\u0441\u0447\u0451\u0442\u0430", v: P.customer })), /* @__PURE__ */ React.createElement("details", { style: { margin: "6px 20px 10px" } }, /* @__PURE__ */ React.createElement("summary", { style: { cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--content-accent-enabled)" } }, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0440\u0430\u0441\u0447\u0451\u0442\u043E\u0432 \u043E\u0431\u044A\u0435\u043A\u0442\u0430 \xB7 ", D.CALC_HISTORY.length), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, display: "flex", flexDirection: "column", gap: 6 } }, D.CALC_HISTORY.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px solid ${c.current ? "var(--red-60)" : "var(--border-secondary-enabled)"}`, borderRadius: "var(--radius-md)", background: c.current ? "var(--red-10)" : "#fff", cursor: "pointer" } }, /* @__PURE__ */ React.createElement(SR.Icon, { name: "file-text", size: 16, color: "var(--content-tertiary-enabled)" }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" } }, c.no, c.current ? " \xB7 \u0442\u0435\u043A\u0443\u0449\u0438\u0439" : ""), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, c.date, " \xB7 ", c.author)), /* @__PURE__ */ React.createElement(SR.Tag, { tone: c.tone, size: "sm" }, c.status))))), /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0435 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u0438" }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px 8px" } }, /* @__PURE__ */ React.createElement(ResMetric, { icon: "square-dashed", v: `${M.roofArea} \u043C\xB2`, k: "\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u043A\u0440\u043E\u0432\u043B\u0438", tone: "blue" }), /* @__PURE__ */ React.createElement(ResMetric, { icon: "snowflake", v: `${M.bagsArea} \u043C\xB2`, k: `\u0421\u043D\u0435\u0433\u043E\u0432\u044B\u0435 \u043C\u0435\u0448\u043A\u0438 \xB7 ${M.bagsShare}%`, tone: "orange" }), /* @__PURE__ */ React.createElement(ResMetric, { icon: "radio", v: `${M.sensors} \u0448\u0442.`, k: "\u0414\u0430\u0442\u0447\u0438\u043A\u043E\u0432", tone: "red" }), /* @__PURE__ */ React.createElement(ResMetric, { icon: "gauge", v: `${M.maxLoad} \u043A\u041F\u0430`, k: "\u041C\u0430\u043A\u0441. \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430", tone: "red" })), /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u0421\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F \u043E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u044F" }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 20px 8px" } }, D.SPEC.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.pos, style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--neutral-15)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "var(--content-tertiary-enabled)", width: 16 } }, s.pos), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 500, color: "var(--content-primary-a-enabled)" } }, s.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, s.note)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: "var(--content-primary-a-enabled)", whiteSpace: "nowrap" } }, s.qty, " ", s.unit)))), /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u0421\u043E\u0441\u0442\u0430\u0432 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0430" }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 12px 12px" } }, /* @__PURE__ */ React.createElement(SR.Cell, { leftIcon: "file-text", title: "PDF-\u0441\u0445\u0435\u043C\u0430 \u043F\u0440\u043E\u0435\u043A\u0442\u0430", subtitle: "\u041F\u043B\u0430\u043D, \u043C\u0435\u0448\u043A\u0438, \u0434\u0430\u0442\u0447\u0438\u043A\u0438, \u043B\u0435\u0433\u0435\u043D\u0434\u0430", rightText: "A1" }), /* @__PURE__ */ React.createElement(SR.Cell, { leftIcon: "sheet", title: "Excel-\u043E\u0442\u0447\u0451\u0442", subtitle: "\u041F\u043B\u043E\u0449\u0430\u0434\u0438, \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B, \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F", rightText: "XLSX" }), /* @__PURE__ */ React.createElement(SR.Cell, { leftIcon: "braces", title: "\u0412\u044B\u0433\u0440\u0443\u0437\u043A\u0430 JSON", subtitle: "\u0414\u043B\u044F \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438 \u0441 CRM / BIM", rightText: "JSON" }))), /* @__PURE__ */ React.createElement("div", { style: { padding: 16, borderTop: "1px solid var(--border-secondary-enabled)", display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement(SR.Button, { variant: "white", icon: "share-2", size: "md", onClick: () => setShowShare(true) }, "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F"), /* @__PURE__ */ React.createElement(SR.Button, { variant: "accent", icon: "download", size: "md", block: true, onClick: onExport }, "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432")), showShare && /* @__PURE__ */ React.createElement(ShareDialog, { onClose: () => setShowShare(false) }))
    }
  );
}
function ResMetric({ icon, v, k, tone }) {
  return /* @__PURE__ */ React.createElement("div", { style: { background: "var(--neutral-10)", borderRadius: "var(--radius-lg)", padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement(SR.Icon, { name: icon, size: 17, color: `var(--${tone}-60)` })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 19, fontWeight: 800, color: "var(--content-primary-a-enabled)", lineHeight: 1.1 } }, v), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)", marginTop: 2 } }, k));
}
function ExportDialog({ onClose }) {
  const [done, setDone] = React.useState(false);
  const docs = [
    { icon: "file-text", t: "PDF-\u0441\u0445\u0435\u043C\u0430 \u043F\u0440\u043E\u0435\u043A\u0442\u0430", s: "\u0424\u043E\u0440\u043C\u0430\u0442 A1 \xB7 \u043A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0448\u0442\u0430\u043C\u043F \u0422\u0435\u0445\u043D\u043E\u041D\u0418\u041A\u041E\u041B\u044C", on: true },
    { icon: "sheet", t: "Excel-\u043E\u0442\u0447\u0451\u0442", s: "\u041F\u043B\u043E\u0449\u0430\u0434\u0438, \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B \u0434\u0430\u0442\u0447\u0438\u043A\u043E\u0432, \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F", on: true },
    { icon: "braces", t: "JSON \u0434\u043B\u044F \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438", s: "\u0413\u0435\u043E\u043C\u0435\u0442\u0440\u0438\u044F, \u0437\u043E\u043D\u044B, \u0434\u0430\u0442\u0447\u0438\u043A\u0438", on: false }
  ];
  return /* @__PURE__ */ React.createElement(
    SR.Dialog,
    {
      title: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432",
      width: 460,
      onClose,
      footer: done ? /* @__PURE__ */ React.createElement(SR.Button, { variant: "primary", icon: "check", onClick: onClose }, "\u0413\u043E\u0442\u043E\u0432\u043E") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(SR.Button, { variant: "secondary", onClick: onClose }, "\u041E\u0442\u043C\u0435\u043D\u0430"), /* @__PURE__ */ React.createElement(SR.Button, { variant: "accent", icon: "download", onClick: () => setDone(true) }, "\u0421\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u0442\u044C"))
    },
    done ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "12px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 56, height: 56, margin: "0 auto 14px", borderRadius: 999, background: "var(--green-10)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(SR.Icon, { name: "check", size: 28, color: "var(--green-55)" })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B \u0441\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u044B"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--content-tertiary-enabled)", marginTop: 4 } }, "\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442 \u043F\u0440\u043E\u0435\u043A\u0442\u043D\u043E\u0439 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u0438 \u043F\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u0443 \xAB\u0421\u0435\u0432\u0435\u0440-2\xBB \u0433\u043E\u0442\u043E\u0432 \u043A \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u044E.")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--content-secondary-enabled)", marginBottom: 2 } }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u044B\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B:"), docs.map((d, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)" } }, /* @__PURE__ */ React.createElement(SR.Icon, { name: d.icon, size: 20, color: "var(--content-secondary-enabled)" }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" } }, d.t), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--content-tertiary-enabled)" } }, d.s)), /* @__PURE__ */ React.createElement(SR.Switch, { defaultChecked: d.on, size: "sm" }))))
  );
}
function InfoRow({ k, v, mono }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)", fontFamily: mono ? "var(--font-family-mono, monospace)" : void 0 } }, v));
}
function ShareDialog({ onClose }) {
  const P = window.SNOW_DATA.PROJECT;
  return /* @__PURE__ */ React.createElement(
    SR.Dialog,
    {
      title: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F \u0440\u0430\u0441\u0447\u0451\u0442\u043E\u043C",
      width: 460,
      onClose,
      footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(SR.Button, { variant: "secondary", onClick: onClose }, "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"), /* @__PURE__ */ React.createElement(SR.Button, { variant: "accent", icon: "copy" }, "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443"))
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--content-secondary-enabled)", marginBottom: 12 } }, "\u0417\u0430\u0449\u0438\u0449\u0451\u043D\u043D\u0430\u044F \u0441\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u0440\u0430\u0441\u0447\u0451\u0442 ", /* @__PURE__ */ React.createElement("b", null, P.calcNo), " \u043E\u0431\u044A\u0435\u043A\u0442\u0430 \xAB\u0421\u0435\u0432\u0435\u0440-2\xBB. \u0414\u043E\u0441\u0442\u0443\u043F \u043F\u043E \u043A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u043E\u043C\u0443 SSO \u0422\u0435\u0445\u043D\u043E\u041D\u0418\u041A\u041E\u041B\u044C."),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", background: "var(--neutral-10)" } }, /* @__PURE__ */ React.createElement(SR.Icon, { name: "link", size: 16, color: "var(--content-tertiary-enabled)" }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontFamily: "monospace", color: "var(--content-secondary-enabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, "https://snow.tn.ru/calc/\u0420\u0421-2025-0042")),
    /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(SR.Switch, { label: "\u0414\u043E\u0441\u0442\u0443\u043F \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430", defaultChecked: true, size: "sm" }), /* @__PURE__ */ React.createElement(SR.Switch, { label: "\u0421\u0441\u044B\u043B\u043A\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 30 \u0434\u043D\u0435\u0439", size: "sm" }))
  );
}
Object.assign(window, { ResultView, ExportDialog });

}); }

// ui_kits/snow/build/RoofCanvas.jsx
try { (() => {
const SnowIcon = window.__lazyTN("Icon");
const RISK_META = {
  critical: { fill: "var(--red-60)", soft: "var(--red-10)", line: "var(--red-65)", label: "\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F", tone: "red" },
  high: { fill: "var(--orange-40)", soft: "var(--orange-10)", line: "var(--orange-50)", label: "\u0412\u044B\u0441\u043E\u043A\u0430\u044F", tone: "orange" },
  medium: { fill: "var(--yellow-30)", soft: "var(--yellow-10)", line: "var(--yellow-40)", label: "\u0421\u0440\u0435\u0434\u043D\u044F\u044F", tone: "yellow" }
};
function ptsStr(pts) {
  return pts.map((p) => p.join(",")).join(" ");
}
function centroid(pts) {
  const n = pts.length;
  return [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n];
}
function shrink(pts, t) {
  const c = centroid(pts);
  return pts.map((p) => [c[0] + (p[0] - c[0]) * (1 - t), c[1] + (p[1] - c[1]) * (1 - t)]);
}
function WindRose({ size = 150, data = window.SNOW_DATA.WINDROSE, north = 0 }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 18;
  const max = Math.max(...data.map((d) => d.v));
  return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, style: { display: "block" } }, /* @__PURE__ */ React.createElement("g", { transform: `rotate(${north} ${cx} ${cy})` }, [0.5, 1].map((f, i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx, cy, r: R * f, fill: "none", stroke: "var(--neutral-20)", strokeWidth: "1", strokeDasharray: i === 0 ? "3 3" : "0" })), data.map((d) => {
    const rad = (d.deg - 90) * Math.PI / 180;
    const len = d.v / max * R;
    const x = cx + Math.cos(rad) * len, y = cy + Math.sin(rad) * len;
    const w = 7;
    const px = cx + Math.cos(rad + Math.PI / 2) * w, py = cy + Math.sin(rad + Math.PI / 2) * w;
    const qx = cx + Math.cos(rad - Math.PI / 2) * w, qy = cy + Math.sin(rad - Math.PI / 2) * w;
    const strong = d.v === max;
    return /* @__PURE__ */ React.createElement(
      "polygon",
      {
        key: d.dir,
        points: `${cx},${cy} ${px},${py} ${x},${y} ${qx},${qy}`,
        fill: strong ? "var(--red-60)" : "var(--blue-40)",
        fillOpacity: strong ? 0.9 : 0.55
      }
    );
  })), [["\u0421", 0], ["\u0412", 90], ["\u042E", 180], ["\u0417", 270]].map(([lab, deg]) => {
    const rad = (deg - 90 + north) * Math.PI / 180;
    const r = R + 11;
    return /* @__PURE__ */ React.createElement(
      "text",
      {
        key: lab,
        x: cx + Math.cos(rad) * r,
        y: cy + Math.sin(rad) * r + 4,
        textAnchor: "middle",
        fontSize: "11",
        fontWeight: lab === "\u0421" ? 800 : 600,
        fill: lab === "\u0421" ? "var(--red-60)" : "var(--content-tertiary-enabled)"
      },
      lab
    );
  }));
}
function NorthArrow({ size = 56, deg = 0 }) {
  const c = size / 2;
  return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, style: { display: "block" } }, /* @__PURE__ */ React.createElement("circle", { cx: c, cy: c, r: c - 2, fill: "#fff", stroke: "var(--border-secondary-enabled)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("g", { transform: `rotate(${deg} ${c} ${c})` }, /* @__PURE__ */ React.createElement("polygon", { points: `${c},${c - (c - 9)} ${c - 6},${c + 4} ${c + 6},${c + 4}`, fill: "var(--red-60)" }), /* @__PURE__ */ React.createElement("polygon", { points: `${c},${c + (c - 12)} ${c - 5},${c + 2} ${c + 5},${c + 2}`, fill: "var(--neutral-35)" })), /* @__PURE__ */ React.createElement("text", { x: c, y: "13", textAnchor: "middle", fontSize: "9", fontWeight: "800", fill: "var(--content-primary-a-enabled)" }, "\u0421"));
}
const PX_PER_M = 6.6;
function meters(px) {
  return (Math.abs(px) / PX_PER_M).toFixed(1).replace(".", ",") + " \u043C";
}
function DistLabel({ x, y, t, tone = "var(--red-65)" }) {
  const w = t.length * 6.6 + 12;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: x - w / 2, y: y - 9, width: w, height: 18, rx: "4", fill: "#fff", stroke: tone, strokeWidth: "1", opacity: "0.96" }), /* @__PURE__ */ React.createElement("text", { x, y: y + 4, textAnchor: "middle", fontSize: "11", fontWeight: "700", fill: tone }, t));
}
function RoofCanvas({ layers = {}, selectedId = null, onSelect, view3d = false, height = "100%" }) {
  const D = window.SNOW_DATA;
  const L = { geometry: true, parapet: true, walkway: false, obstacles: false, bags: false, sensors: false, dims: false, north: false, wind: false, underlay: false, editHandles: false, sensorDims: false, parapetLabel: false, ...layers };
  const sel = (id) => onSelect && onSelect(id);
  return /* @__PURE__ */ React.createElement("div", { style: { width: "100%", height, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", perspective: view3d ? "1500px" : "none" } }, /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 1000 680",
      width: "100%",
      height: "100%",
      preserveAspectRatio: "xMidYMid meet",
      style: {
        maxHeight: "100%",
        transition: "transform .45s ease",
        transform: view3d ? "rotateX(56deg) rotateZ(-20deg) scale(.92)" : "none",
        transformOrigin: "center 62%",
        filter: view3d ? "drop-shadow(0 40px 30px rgba(20,24,38,.22))" : "none"
      }
    },
    /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("pattern", { id: "snowGrid", width: "34", height: "34", patternUnits: "userSpaceOnUse" }, /* @__PURE__ */ React.createElement("path", { d: "M34 0H0V34", fill: "none", stroke: "var(--neutral-15)", strokeWidth: "1" })), Object.keys(RISK_META).map((r) => /* @__PURE__ */ React.createElement("radialGradient", { key: r, id: `baggrad-${r}`, cx: "50%", cy: "50%", r: "62%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: RISK_META[r].fill, stopOpacity: "0.62" }), /* @__PURE__ */ React.createElement("stop", { offset: "55%", stopColor: RISK_META[r].fill, stopOpacity: "0.34" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: RISK_META[r].fill, stopOpacity: "0" }))), /* @__PURE__ */ React.createElement("filter", { id: "bagblur", x: "-40%", y: "-40%", width: "180%", height: "180%" }, /* @__PURE__ */ React.createElement("feGaussianBlur", { stdDeviation: "10" })), /* @__PURE__ */ React.createElement("clipPath", { id: "roofclip" }, /* @__PURE__ */ React.createElement("polygon", { points: ptsStr(D.ROOF) }))),
    /* @__PURE__ */ React.createElement("rect", { x: "0", y: "0", width: "1000", height: "680", fill: "var(--neutral-10)" }),
    L.underlay && /* @__PURE__ */ React.createElement("g", { transform: "translate(8 10) rotate(0.7 500 340)", opacity: "0.55" }, /* @__PURE__ */ React.createElement("polygon", { points: ptsStr(D.ROOF), fill: "none", stroke: "var(--blue-55)", strokeWidth: "1.5", strokeDasharray: "7 5" }), D.OBSTACLES.filter((o) => o.shape !== "circle").map((o) => /* @__PURE__ */ React.createElement("rect", { key: o.id, x: o.x, y: o.y, width: o.w, height: o.h, fill: "none", stroke: "var(--blue-55)", strokeWidth: "1.2", strokeDasharray: "5 4" }))),
    L.geometry && /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("polygon", { points: ptsStr(D.ROOF), fill: "#ffffff" }), /* @__PURE__ */ React.createElement("polygon", { points: ptsStr(D.ROOF), fill: "url(#snowGrid)" }), /* @__PURE__ */ React.createElement("polygon", { points: ptsStr(D.ROOF), fill: "none", stroke: "var(--content-primary-a-enabled)", strokeWidth: "2.5", strokeLinejoin: "round" }), L.parapet && /* @__PURE__ */ React.createElement("polygon", { points: ptsStr(D.ROOF), fill: "none", stroke: "var(--neutral-45)", strokeWidth: "7", strokeOpacity: "0.35", strokeLinejoin: "round" }), L.parapet && L.parapetLabel && /* @__PURE__ */ React.createElement("g", { fill: "var(--blue-65)", fontSize: "11.5", fontWeight: "700" }, /* @__PURE__ */ React.createElement("rect", { x: 418, y: 74, width: 164, height: 18, rx: "4", fill: "#fff", stroke: "var(--blue-40)", opacity: "0.95" }), /* @__PURE__ */ React.createElement("text", { x: 500, y: 87, textAnchor: "middle" }, "\u041F\u0430\u0440\u0430\u043F\u0435\u0442 \xB7 h 600 \u043C\u043C"))),
    L.bags && /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("g", { clipPath: "url(#roofclip)" }, D.SNOWBAGS.map((z) => /* @__PURE__ */ React.createElement("polygon", { key: z.id + "-f", points: ptsStr(z.poly), fill: `url(#baggrad-${z.risk})`, filter: "url(#bagblur)" }))), D.SNOWBAGS.map((z) => {
      const m = RISK_META[z.risk];
      const on = selectedId === z.id;
      return /* @__PURE__ */ React.createElement("g", { key: z.id, style: { cursor: onSelect ? "pointer" : "default" }, onClick: () => sel(z.id) }, /* @__PURE__ */ React.createElement(
        "polygon",
        {
          points: ptsStr(z.poly),
          fill: "transparent",
          stroke: m.line,
          strokeWidth: on ? 2.5 : 1.1,
          strokeDasharray: "5 4",
          strokeOpacity: on ? 0.95 : 0.45
        }
      ), !view3d && /* @__PURE__ */ React.createElement(
        "text",
        {
          x: centroid(z.poly)[0],
          y: centroid(z.poly)[1] + 4,
          textAnchor: "middle",
          fontSize: "13",
          fontWeight: "800",
          fill: m.line
        },
        z.id
      ));
    })),
    L.walkway && /* @__PURE__ */ React.createElement(
      "polyline",
      {
        points: ptsStr(D.WALKWAY),
        fill: "none",
        stroke: "var(--blue-40)",
        strokeWidth: "6",
        strokeDasharray: "2 8",
        strokeLinecap: "round",
        strokeOpacity: "0.7"
      }
    ),
    L.obstacles && D.OBSTACLES.map((o) => {
      const on = selectedId === o.id;
      if (o.shape === "circle") {
        return /* @__PURE__ */ React.createElement("g", { key: o.id, style: { cursor: onSelect ? "pointer" : "default" }, onClick: () => sel(o.id) }, /* @__PURE__ */ React.createElement("circle", { cx: o.cx, cy: o.cy, r: o.r, fill: "#fff", stroke: "var(--blue-55)", strokeWidth: on ? 3 : 2 }), /* @__PURE__ */ React.createElement("circle", { cx: o.cx, cy: o.cy, r: o.r - 4, fill: "var(--blue-40)", fillOpacity: "0.5" }));
      }
      return /* @__PURE__ */ React.createElement("g", { key: o.id, style: { cursor: onSelect ? "pointer" : "default" }, onClick: () => sel(o.id) }, /* @__PURE__ */ React.createElement(
        "rect",
        {
          x: o.x,
          y: o.y,
          width: o.w,
          height: o.h,
          rx: "3",
          fill: on ? "var(--neutral-20)" : "var(--neutral-15)",
          stroke: on ? "var(--content-primary-a-enabled)" : "var(--neutral-45)",
          strokeWidth: on ? 2.5 : 1.5
        }
      ), /* @__PURE__ */ React.createElement("line", { x1: o.x, y1: o.y, x2: o.x + o.w, y2: o.y + o.h, stroke: "var(--neutral-35)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("line", { x1: o.x + o.w, y1: o.y, x2: o.x, y2: o.y + o.h, stroke: "var(--neutral-35)", strokeWidth: "1" }), !view3d && /* @__PURE__ */ React.createElement(
        "text",
        {
          x: o.x + o.w / 2,
          y: o.y + o.h / 2 + 4,
          textAnchor: "middle",
          fontSize: "11",
          fontWeight: "600",
          fill: "var(--content-secondary-enabled)"
        },
        o.short
      ), on && L.editHandles && !view3d && [[o.x, o.y], [o.x + o.w, o.y], [o.x, o.y + o.h], [o.x + o.w, o.y + o.h]].map((p, i) => /* @__PURE__ */ React.createElement("rect", { key: i, x: p[0] - 4.5, y: p[1] - 4.5, width: "9", height: "9", fill: "#fff", stroke: "var(--red-60)", strokeWidth: "2", style: { cursor: "nwse-resize" } })), on && L.editHandles && !view3d && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DimLine, { x1: o.x, y1: o.y - 16, x2: o.x + o.w, y2: o.y - 16, label: meters(o.w) }), /* @__PURE__ */ React.createElement(DimLine, { x1: o.x - 16, y1: o.y, x2: o.x - 16, y2: o.y + o.h, label: meters(o.h), vertical: true })));
    }),
    L.sensorDims && (() => {
      const s = D.SENSORS.find((x) => x.id === selectedId);
      if (!s) return null;
      const bottomY = s.x < 560 ? 590 : 440;
      let best = null, bd = 1e9;
      D.OBSTACLES.forEach((o) => {
        const cx = o.shape === "circle" ? o.cx : o.x + o.w / 2;
        const cy = o.shape === "circle" ? o.cy : o.y + o.h / 2;
        const d = Math.hypot(cx - s.x, cy - s.y);
        if (d < bd) {
          bd = d;
          best = { cx, cy };
        }
      });
      return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("line", { x1: 90, y1: s.y, x2: s.x, y2: s.y, stroke: "var(--red-60)", strokeWidth: "1.2", strokeDasharray: "4 3" }), /* @__PURE__ */ React.createElement(DistLabel, { x: (90 + s.x) / 2, y: s.y - 12, t: meters(s.x - 90) }), /* @__PURE__ */ React.createElement("line", { x1: s.x, y1: s.y, x2: s.x, y2: bottomY, stroke: "var(--red-60)", strokeWidth: "1.2", strokeDasharray: "4 3" }), /* @__PURE__ */ React.createElement(DistLabel, { x: s.x, y: (s.y + bottomY) / 2, t: meters(bottomY - s.y) }), best && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: s.x, y1: s.y, x2: best.cx, y2: best.cy, stroke: "var(--blue-55)", strokeWidth: "1.2", strokeDasharray: "4 3" }), /* @__PURE__ */ React.createElement(DistLabel, { x: (s.x + best.cx) / 2, y: (s.y + best.cy) / 2, t: meters(bd), tone: "var(--blue-60)" })));
    })(),
    L.sensors && D.SENSORS.map((s) => {
      const on = selectedId === s.id;
      return /* @__PURE__ */ React.createElement("g", { key: s.id, style: { cursor: onSelect ? "pointer" : "default" }, onClick: () => sel(s.id) }, on && /* @__PURE__ */ React.createElement("circle", { cx: s.x, cy: s.y, r: "16", fill: "var(--red-60)", fillOpacity: "0.15" }), /* @__PURE__ */ React.createElement("circle", { cx: s.x, cy: s.y, r: "9", fill: "var(--red-60)", stroke: "#fff", strokeWidth: "2.5" }), /* @__PURE__ */ React.createElement("circle", { cx: s.x, cy: s.y, r: "3", fill: "#fff" }));
    }),
    L.dims && /* @__PURE__ */ React.createElement("g", { fontSize: "12", fontWeight: "600", fill: "var(--content-tertiary-enabled)" }, /* @__PURE__ */ React.createElement(DimLine, { x1: 90, y1: 64, x2: 910, y2: 64, label: "124,0 \u043C" }), /* @__PURE__ */ React.createElement(DimLine, { x1: 64, y1: 90, x2: 64, y2: 590, label: "76,0 \u043C", vertical: true }), /* @__PURE__ */ React.createElement(DimLine, { x1: 560, y1: 616, x2: 910, y2: 616, label: "53,0 \u043C", flip: true })),
    L.north && /* @__PURE__ */ React.createElement("g", { transform: "translate(866, 142)" }, /* @__PURE__ */ React.createElement("foreignObject", { x: "-40", y: "-40", width: "120", height: "120" }, /* @__PURE__ */ React.createElement("div", { xmlns: "http://www.w3.org/1999/xhtml", style: { width: 120, height: 120 } }, /* @__PURE__ */ React.createElement(WindRose, { size: 120, north: D.CLIMATE.northDeg }))))
  ));
}
function DimLine({ x1, y1, x2, y2, label, vertical, flip }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return /* @__PURE__ */ React.createElement("g", { stroke: "var(--neutral-45)", strokeWidth: "1" }, /* @__PURE__ */ React.createElement("line", { x1, y1, x2, y2 }), /* @__PURE__ */ React.createElement("line", { x1, y1: vertical ? y1 : y1 - 5, x2: x1, y2: vertical ? y1 : y1 + 5 }), /* @__PURE__ */ React.createElement("line", { x1: x2, y1: vertical ? y2 : y2 - 5, x2, y2: vertical ? y2 : y2 + 5 }), vertical ? /* @__PURE__ */ React.createElement("text", { x: x1 - 6, y: my, textAnchor: "middle", stroke: "none", transform: `rotate(-90 ${x1 - 6} ${my})` }, label) : /* @__PURE__ */ React.createElement("text", { x: mx, y: flip ? y1 + 16 : y1 - 6, textAnchor: "middle", stroke: "none" }, label));
}
Object.assign(window, { RoofCanvas, WindRose, NorthArrow, RISK_META });

}); }

// ui_kits/snow/build/Shell.jsx
try { (() => {
const ShIcon = window.__lazyTN("Icon"), ShAvatar = window.__lazyTN("Avatar"), ShButton = window.__lazyTN("Button");
function AppHeader({ project, onHome }) {
  return /* @__PURE__ */ React.createElement("div", { style: {
    height: 64,
    flex: "0 0 64px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "0 24px",
    background: "#fff",
    borderBottom: "1px solid var(--border-secondary-enabled)"
  } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onHome, style: { display: "flex", alignItems: "center", gap: 12, border: "none", background: "transparent", cursor: "pointer", padding: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 34, height: 34, borderRadius: 8, background: "var(--red-60)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" } }, "TN")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", lineHeight: 1.15, textAlign: "left" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, "\u0421\u043D\u0435\u0433\u043E\u0432\u044B\u0435 \u043C\u0435\u0448\u043A\u0438"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 500, color: "var(--content-tertiary-enabled)" } }, "\u041C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u0441\u043D\u0435\u0433\u043E\u0432\u043E\u0439 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0438"))), project && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { width: 1, height: 26, background: "var(--border-secondary-enabled)" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 } }, /* @__PURE__ */ React.createElement(ShIcon, { name: "building-2", size: 17, color: "var(--content-tertiary-enabled)" }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600, color: "var(--content-primary-a-enabled)", whiteSpace: "nowrap" } }, project.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--content-tertiary-enabled)", whiteSpace: "nowrap" } }, "\xB7 ", project.address))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(HdrIcon, { icon: "circle-help", title: "\u0421\u043F\u0440\u0430\u0432\u043A\u0430" }), /* @__PURE__ */ React.createElement(HdrIcon, { icon: "bell", title: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F", dot: true }), /* @__PURE__ */ React.createElement("div", { style: { width: 1, height: 26, background: "var(--border-secondary-enabled)", margin: "0 4px" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(ShAvatar, { text: "\u0413\u0410", size: "sm" }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", lineHeight: 1.2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" } }, "\u0413\u0440\u043E\u043C\u043E\u0432 \u0410. \u0418."), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--content-tertiary-enabled)" } }, "\u0418\u043D\u0436\u0435\u043D\u0435\u0440-\u043F\u0440\u043E\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u0449\u0438\u043A"))));
}
function HdrIcon({ icon, title, dot }) {
  const [h, setH] = React.useState(false);
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      title,
      onMouseEnter: () => setH(true),
      onMouseLeave: () => setH(false),
      style: { position: "relative", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 8, cursor: "pointer", background: h ? "var(--neutral-10)" : "transparent", transition: "background .12s" }
    },
    /* @__PURE__ */ React.createElement(ShIcon, { name: icon, size: 20, color: "var(--neutral-55)" }),
    dot && /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 999, background: "var(--red-60)", border: "1.5px solid #fff" } })
  );
}
function Stepper({ steps, current, maxReached, onJump }) {
  return /* @__PURE__ */ React.createElement("div", { style: { height: 72, flex: "0 0 72px", display: "flex", alignItems: "center", padding: "0 24px", background: "#fff", borderBottom: "1px solid var(--border-secondary-enabled)", gap: 0 } }, steps.map((s, i) => {
    const done = i < current;
    const active = i === current;
    const reachable = i <= maxReached;
    const color = active ? "var(--red-60)" : done ? "var(--content-primary-a-enabled)" : "var(--neutral-40)";
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: s.id }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: !reachable,
        onClick: () => reachable && onJump(i),
        style: { display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", padding: "6px 8px", cursor: reachable ? "pointer" : "default", borderRadius: 8 }
      },
      /* @__PURE__ */ React.createElement("span", { style: {
        width: 28,
        height: 28,
        flex: "0 0 28px",
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        background: active ? "var(--red-60)" : done ? "var(--content-primary-a-enabled)" : "var(--neutral-15)",
        color: active || done ? "#fff" : "var(--neutral-50)",
        border: active ? "none" : done ? "none" : "1px solid var(--neutral-25)",
        transition: "all .15s"
      } }, done ? /* @__PURE__ */ React.createElement(ShIcon, { name: "check", size: 15, color: "#fff" }) : s.n),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: active ? 700 : 600, color, whiteSpace: "nowrap" } }, s.label)
    ), i < steps.length - 1 && /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 2, minWidth: 12, background: i < current ? "var(--content-primary-a-enabled)" : "var(--neutral-20)", margin: "0 2px", borderRadius: 2 } }));
  }));
}
function WizardFooter({ current, total, onBack, onNext, nextLabel, nextIcon, nextVariant, hint, onDraft }) {
  return /* @__PURE__ */ React.createElement("div", { style: { height: 72, flex: "0 0 72px", display: "flex", alignItems: "center", gap: 14, padding: "0 28px", background: "#fff", borderTop: "1px solid var(--border-secondary-enabled)" } }, /* @__PURE__ */ React.createElement(ShButton, { variant: "white", icon: "arrow-left", size: "md", onClick: onBack, disabled: current === 0 }, "\u041D\u0430\u0437\u0430\u0434"), hint && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginLeft: 6 } }, /* @__PURE__ */ React.createElement(ShIcon, { name: "info", size: 16, color: "var(--content-tertiary-enabled)" }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--content-tertiary-enabled)" } }, hint)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "var(--content-tertiary-enabled)" } }, "\u0428\u0430\u0433 ", current + 1, " \u0438\u0437 ", total), onDraft && /* @__PURE__ */ React.createElement(ShButton, { variant: "secondary", icon: "save", size: "md", onClick: onDraft }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0447\u0435\u0440\u043D\u043E\u0432\u0438\u043A"), /* @__PURE__ */ React.createElement(ShButton, { variant: nextVariant || "primary", iconRight: nextIcon || "arrow-right", size: "md", onClick: onNext }, nextLabel || "\u0414\u0430\u043B\u0435\u0435"));
}
function WorkArea({ canvas, panel, panelWidth = 380 }) {
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", minHeight: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0, position: "relative", background: "var(--neutral-10)", display: "flex" } }, canvas), /* @__PURE__ */ React.createElement("div", { style: { width: panelWidth, flex: `0 0 ${panelWidth}px`, borderLeft: "1px solid var(--border-secondary-enabled)", background: "#fff", display: "flex", flexDirection: "column", minHeight: 0 } }, panel));
}
function PanelHead({ title, count, action }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "18px 20px 12px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, title), count != null && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "var(--content-tertiary-enabled)" } }, "\xB7 ", count), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), action);
}
Object.assign(window, { AppHeader, Stepper, WizardFooter, WorkArea, PanelHead });

}); }

// ui_kits/snow/build/StepsA.jsx
try { (() => {
const SA = window.__lazyNS();
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " \u0411";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1).replace(".", ",") + " \u041A\u0411";
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",") + " \u041C\u0411";
}
function StepUpload({
  isNew = false,
  files = [],
  scale = null,
  mapAddress = "",
  mapSelected = false,
  onFileAdd,
  onMapSelect
}) {
  const [tab, setTab] = React.useState("file");
  const [zoom, setZoom] = React.useState(100);
  const [rot, setRot] = React.useState(0);
  const [address, setAddress] = React.useState(mapAddress);
  const fileRef = React.useRef(null);
  React.useEffect(() => {
    setAddress(mapAddress);
  }, [mapAddress]);
  const hasFile = files.length > 0;
  const showFilePreview = !isNew || hasFile;
  const showMap = !isNew || mapSelected;
  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (!file || !onFileAdd) return;
    onFileAdd({
      name: file.name,
      size: formatFileSize(file.size),
      desc: /\.(dwg|dxf)$/i.test(file.name) ? "\u0443\u0437\u0435\u043B / \u0447\u0435\u0440\u0442\u0451\u0436" : "\u043F\u043B\u0430\u043D \u043A\u0440\u043E\u0432\u043B\u0438",
      selected: true
    });
    e.target.value = "";
  }
  function handleMapSearch() {
    const q = address.trim();
    if (!q || !onMapSelect) return;
    onMapSelect(q);
  }
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", minHeight: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--neutral-10)" } }, /* @__PURE__ */ React.createElement(
    SA.Tabs,
    {
      variant: "segmented",
      value: tab,
      options: [{ id: "file", name: "\u0424\u0430\u0439\u043B \u0447\u0435\u0440\u0442\u0435\u0436\u0430", icon: "file-text" }, { id: "map", name: "\u0410\u0434\u0440\u0435\u0441 \u043D\u0430 \u043A\u0430\u0440\u0442\u0435", icon: "map-pin" }],
      onChange: setTab
    }
  ), tab === "file" ? /* @__PURE__ */ React.createElement(React.Fragment, null, showFilePreview && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", background: "#fff", borderBottom: "1px solid var(--border-secondary-enabled)", margin: "0 20px", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" } }, /* @__PURE__ */ React.createElement(ViewBtn, { icon: "minus", onClick: () => setZoom((z) => Math.max(40, z - 20)) }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600, width: 48, textAlign: "center", color: "var(--content-secondary-enabled)" } }, zoom, "%"), /* @__PURE__ */ React.createElement(ViewBtn, { icon: "plus", onClick: () => setZoom((z) => Math.min(200, z + 20)) }), /* @__PURE__ */ React.createElement("div", { style: { width: 1, height: 22, background: "var(--border-secondary-enabled)", margin: "0 6px" } }), /* @__PURE__ */ React.createElement(ViewBtn, { icon: "rotate-cw", onClick: () => setRot((r) => r + 90) }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(SA.Button, { variant: "white", icon: "ruler", size: "sm" }, "\u041F\u0440\u0438\u0432\u044F\u0437\u0430\u0442\u044C \u043C\u0430\u0441\u0448\u0442\u0430\u0431", scale ? ` \xB7 ${scale}` : "")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "hidden" } }, showFilePreview ? /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1px solid var(--border-secondary-enabled)", boxShadow: "var(--shadow-small)", borderRadius: 4, padding: 18, transform: `scale(${zoom / 100}) rotate(${rot}deg)`, transition: "transform .25s" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 560, height: 380, filter: "grayscale(1) opacity(.7)" } }, /* @__PURE__ */ React.createElement(window.RoofCanvas, { layers: { geometry: true, parapet: true, obstacles: true }, height: "380px" })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, fontFamily: "var(--font-family-mono, monospace)", fontSize: 11, color: "var(--content-tertiary-enabled)", textAlign: "center" } }, (files.find((f) => f.selected) || files[0])?.name || "\u041A\u0440\u043E\u0432\u043B\u044F_\u0421\u0435\u0432\u0435\u0440-2.pdf", " \xB7 \u043B\u0438\u0441\u0442 1 \xB7 \u043F\u043B\u0430\u043D \u043A\u0440\u043E\u0432\u043B\u0438")) : /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", maxWidth: 320 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 64, height: 64, margin: "0 auto 16px", borderRadius: 999, background: "var(--neutral-15)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(SA.Icon, { name: "file-text", size: 28, color: "var(--neutral-40)" })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 600, color: "var(--content-secondary-enabled)", marginBottom: 6 } }, "\u0427\u0435\u0440\u0442\u0451\u0436 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--content-tertiary-enabled)", lineHeight: 1.5 } }, "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u0432 \u043F\u0430\u043D\u0435\u043B\u0438 \u0441\u043F\u0440\u0430\u0432\u0430 \u2014 \u043F\u043B\u0430\u043D \u043A\u0440\u043E\u0432\u043B\u0438 \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C")))) : /* @__PURE__ */ React.createElement("div", { style: { flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", margin: 20, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-secondary-enabled)", background: "repeating-linear-gradient(45deg, #eef0f4, #eef0f4 12px, #e7e9ef 12px, #e7e9ef 24px)" } }, showMap && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(circle at 60% 45%, rgba(225,27,17,.10), transparent 40%)" } }), showMap && /* @__PURE__ */ React.createElement(SA.Icon, { name: "map-pin", size: 40, color: "var(--red-60)", style: { position: "absolute", top: "42%", left: "60%" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 16, left: 16, right: 16, display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(
    SA.Input,
    {
      icon: "search",
      placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u043E\u0431\u044A\u0435\u043A\u0442\u0430",
      value: address,
      onChange: (e) => setAddress(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && handleMapSearch()
    }
  )), /* @__PURE__ */ React.createElement(SA.Button, { variant: "accent", icon: "map-pin", size: "lg", onClick: handleMapSearch }, "\u0423\u043A\u0430\u0437\u0430\u0442\u044C \u043D\u0430 \u043A\u0430\u0440\u0442\u0435")), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "monospace", fontSize: 12, color: "var(--neutral-55)" } }, showMap ? "\u042F\u043D\u0434\u0435\u043A\u0441.\u041A\u0430\u0440\u0442\u044B \xB7 \u0441\u043F\u0443\u0442\u043D\u0438\u043A\u043E\u0432\u044B\u0439 \u0441\u043D\u0438\u043C\u043E\u043A" : "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0423\u043A\u0430\u0437\u0430\u0442\u044C \u043D\u0430 \u043A\u0430\u0440\u0442\u0435\xBB"))), /* @__PURE__ */ React.createElement("div", { style: { width: 380, flex: "0 0 380px", borderLeft: "1px solid var(--border-secondary-enabled)", background: "#fff", display: "flex", flexDirection: "column", overflowY: "auto" } }, tab === "file" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A \u0434\u0430\u043D\u043D\u044B\u0445" }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 20px 16px" } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      role: "button",
      tabIndex: 0,
      onClick: () => fileRef.current?.click(),
      onKeyDown: (e) => e.key === "Enter" && fileRef.current?.click(),
      style: { border: "1.5px dashed var(--border-secondary-enabled)", borderRadius: "var(--radius-lg)", padding: "22px 18px", textAlign: "center", background: "var(--neutral-10)", cursor: "pointer" }
    },
    /* @__PURE__ */ React.createElement("input", { ref: fileRef, type: "file", accept: ".pdf,.dwg,.dxf,.jpg,.jpeg,.png", hidden: true, onChange: handleFileInput }),
    /* @__PURE__ */ React.createElement("div", { style: { width: 46, height: 46, margin: "0 auto 10px", borderRadius: 999, background: "var(--red-10)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(SA.Icon, { name: "upload", size: 22, color: "var(--red-60)" })),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 600, color: "var(--content-primary-a-enabled)" } }, "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u0441\u044E\u0434\u0430"),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--content-tertiary-enabled)", margin: "4px 0 12px" } }, "PDF, DWG, DXF, JPG, PNG \xB7 \u0434\u043E 100 \u041C\u0411"),
    /* @__PURE__ */ React.createElement(SA.Button, { variant: "white", size: "sm", icon: "folder-open", onClick: (e) => {
      e.stopPropagation();
      fileRef.current?.click();
    } }, "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0444\u0430\u0439\u043B")
  )), hasFile && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0435 \u0444\u0430\u0439\u043B\u044B", count: files.length }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 12px" } }, files.map((f, i) => /* @__PURE__ */ React.createElement(
    SA.Cell,
    {
      key: i,
      leftIcon: "file-text",
      title: f.name,
      subtitle: `${f.size} \xB7 ${f.desc}`,
      rightIcon: f.selected ? "check" : "ellipsis-vertical",
      selected: f.selected
    }
  )))), scale && /* @__PURE__ */ React.createElement("div", { style: { margin: "12px 20px", padding: "14px 16px", background: "var(--blue-10)", borderRadius: "var(--radius-md)", display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement(SA.Icon, { name: "info", size: 18, color: "var(--blue-60)" }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--blue-65)", lineHeight: 1.45 } }, "\u041C\u0430\u0441\u0448\u0442\u0430\u0431 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D \u043F\u043E \u0448\u0442\u0430\u043C\u043F\u0443 \u0447\u0435\u0440\u0442\u0435\u0436\u0430: ", /* @__PURE__ */ React.createElement("b", null, scale), ". \u041F\u0440\u0438 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E\u0441\u0442\u0438 \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E \u043F\u043E \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u043C\u0443 \u0440\u0430\u0437\u043C\u0435\u0440\u0443."))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u0410\u0434\u0440\u0435\u0441 \u043E\u0431\u044A\u0435\u043A\u0442\u0430" }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "\u0410\u0434\u0440\u0435\u0441 \u043D\u0430 \u043A\u0430\u0440\u0442\u0435" }, /* @__PURE__ */ React.createElement(
    SA.Input,
    {
      icon: "map-pin",
      placeholder: "\u0433. \u0415\u043A\u0430\u0442\u0435\u0440\u0438\u043D\u0431\u0443\u0440\u0433, \u0443\u043B. \u041F\u0440\u0438\u043C\u0435\u0440\u043D\u0430\u044F, 1",
      value: address,
      onChange: (e) => setAddress(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && handleMapSearch()
    }
  )), /* @__PURE__ */ React.createElement(SA.Button, { variant: "accent", icon: "search", size: "md", block: true, onClick: handleMapSearch }, "\u041D\u0430\u0439\u0442\u0438 \u043D\u0430 \u042F\u043D\u0434\u0435\u043A\u0441.\u041A\u0430\u0440\u0442\u0430\u0445"), mapSelected ? /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 14px", background: "var(--green-10)", borderRadius: "var(--radius-md)", display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement(SA.Icon, { name: "circle-check", size: 18, color: "var(--green-55)" }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--green-65)", lineHeight: 1.45 } }, "\u041E\u0431\u044A\u0435\u043A\u0442 \u043D\u0430\u0439\u0434\u0435\u043D. \u0421\u043F\u0443\u0442\u043D\u0438\u043A\u043E\u0432\u044B\u0439 \u0441\u043D\u0438\u043C\u043E\u043A \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D \u2014 \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043A\u043E\u043D\u0442\u0443\u0440 \u0437\u0434\u0430\u043D\u0438\u044F \u043D\u0430 \u043A\u0430\u0440\u0442\u0435.")) : /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 12.5, color: "var(--content-tertiary-enabled)", lineHeight: 1.45 } }, "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u043E\u0431\u044A\u0435\u043A\u0442\u0430 \u2014 \u043A\u0430\u0440\u0442\u0430 \u043E\u0442\u043E\u0431\u0440\u0430\u0437\u0438\u0442 \u0441\u043F\u0443\u0442\u043D\u0438\u043A\u043E\u0432\u044B\u0439 \u0441\u043D\u0438\u043C\u043E\u043A \u043A\u0440\u043E\u0432\u043B\u0438 \u0434\u043B\u044F \u0434\u0430\u043B\u044C\u043D\u0435\u0439\u0448\u0435\u0439 \u043E\u0431\u0432\u043E\u0434\u043A\u0438 \u043A\u043E\u043D\u0442\u0443\u0440\u0430.")))));
}
function Field({ label, children }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 600, color: "var(--content-secondary-enabled)", marginBottom: 6 } }, label), children);
}
function ViewBtn({ icon, onClick }) {
  const [h, setH] = React.useState(false);
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick,
      onMouseEnter: () => setH(true),
      onMouseLeave: () => setH(false),
      style: { width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-secondary-enabled)", borderRadius: 8, cursor: "pointer", background: h ? "var(--neutral-10)" : "#fff" }
    },
    /* @__PURE__ */ React.createElement(SA.Icon, { name: icon, size: 16, color: "var(--content-secondary-enabled)" })
  );
}
const GEO_ITEMS = [
  { icon: "spline", name: "\u0412\u043D\u0435\u0448\u043D\u0438\u0439 \u043A\u043E\u043D\u0442\u0443\u0440 \u043A\u0440\u043E\u0432\u043B\u0438", val: "L-\u043E\u0431\u0440\u0430\u0437\u043D\u044B\u0439, 6 \u0432\u0435\u0440\u0448\u0438\u043D", conf: 98 },
  { icon: "frame", name: "\u041F\u0430\u0440\u0430\u043F\u0435\u0442 \u043F\u043E \u043F\u0435\u0440\u0438\u043C\u0435\u0442\u0440\u0443", val: "\u0412\u044B\u0441\u043E\u0442\u0430 600 \u043C\u043C", conf: 95 },
  { icon: "layout-dashboard", name: "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0435 \u0437\u043E\u043D\u044B / \u0443\u043A\u043B\u043E\u043D\u044B", val: "4 \u0441\u043A\u0430\u0442\u0430 \u043A \u0432\u043E\u0440\u043E\u043D\u043A\u0430\u043C", conf: 90 },
  { icon: "move-diagonal", name: "\u0413\u0430\u0431\u0430\u0440\u0438\u0442\u044B \u0432 \u043F\u043B\u0430\u043D\u0435", val: "124,0 \xD7 76,0 \u043C", conf: 96 }
];
function StepRoof() {
  const D = window.SNOW_DATA;
  const [tab, setTab] = React.useState("geo");
  const [sel, setSel] = React.useState("shaft-1");
  const [underlay, setUnderlay] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [draw, setDraw] = React.useState(null);
  const [edit, setEdit] = React.useState(false);
  const [picked, setPicked] = React.useState(null);
  const list = D.OBSTACLES;
  const selObj = list.find((o) => o.id === sel);
  const pickType = (t) => {
    setDraw(t);
    setAddOpen(false);
    setPicked(null);
  };
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", minHeight: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0, position: "relative", background: "var(--neutral-10)", display: "flex", cursor: draw ? "crosshair" : "default" } }, /* @__PURE__ */ React.createElement(
    window.RoofCanvas,
    {
      layers: { geometry: true, parapet: true, obstacles: true, walkway: true, dims: true, parapetLabel: true, underlay, editHandles: true },
      selectedId: sel,
      onSelect: (id) => {
        setSel(id);
        setEdit(false);
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,.95)", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--shadow-small)" } }, /* @__PURE__ */ React.createElement(Toggle, { on: underlay, onClick: () => setUnderlay((v) => !v) }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" } }, "\u041F\u043E\u0434\u043B\u043E\u0436\u043A\u0430 (\u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B)"), underlay && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "var(--blue-65)" } }, "\xB7 \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0441 \u0447\u0435\u0440\u0442\u0435\u0436\u043E\u043C")), draw && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 12, background: "var(--red-60)", color: "#fff", borderRadius: "var(--radius-md)", padding: "10px 14px", boxShadow: "var(--shadow-large)" } }, /* @__PURE__ */ React.createElement(SA.Icon, { name: "pen-line", size: 18, color: "#fff" }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 600 } }, "\u0420\u0435\u0436\u0438\u043C \u0447\u0435\u0440\u0447\u0435\u043D\u0438\u044F: \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \xAB", draw, "\xBB \u043D\u0430 \u043F\u043B\u0430\u043D\u0435 \u043A\u0440\u043E\u0432\u043B\u0438"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setDraw(null), style: { border: "none", background: "rgba(255,255,255,.2)", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" } }, "\u041E\u0442\u043C\u0435\u043D\u0430"))), /* @__PURE__ */ React.createElement("div", { style: { width: 400, flex: "0 0 400px", borderLeft: "1px solid var(--border-secondary-enabled)", background: "#fff", display: "flex", flexDirection: "column", minHeight: 0 } }, /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u042D\u043B\u0435\u043C\u0435\u043D\u0442\u044B \u043A\u0440\u043E\u0432\u043B\u0438", count: list.length }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", minHeight: 0, flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { margin: "0 20px 12px", padding: "10px 14px", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement(SA.Icon, { name: "frame", size: 18, color: "var(--blue-60)" }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--content-primary-a-enabled)" } }, "\u041F\u0430\u0440\u0430\u043F\u0435\u0442 \u043F\u043E \u043F\u0435\u0440\u0438\u043C\u0435\u0442\u0440\u0443"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, "\u0412\u044B\u0441\u043E\u0442\u0430 \u0432\u043B\u0438\u044F\u0435\u0442 \u043D\u0430 \u0441\u043D\u0435\u0433\u043E\u0432\u044B\u0435 \u043C\u0435\u0448\u043A\u0438")), /* @__PURE__ */ React.createElement("div", { style: { width: 84 } }, /* @__PURE__ */ React.createElement(SA.Input, { size: "sm", defaultValue: "600" })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--content-tertiary-enabled)" } }, "\u043C\u043C")), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 20px 12px" } }, /* @__PURE__ */ React.createElement(SA.Button, { variant: "primary", icon: "plus", size: "md", block: true, onClick: () => setAddOpen(true) }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u044D\u043B\u0435\u043C\u0435\u043D\u0442")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "0 12px" } }, list.map((o) => /* @__PURE__ */ React.createElement(
    SA.Cell,
    {
      key: o.id,
      selected: o.id === sel,
      onClick: () => {
        setSel(o.id);
        setEdit(false);
      },
      leftIcon: o.shape === "circle" ? "circle-dot" : "box",
      title: o.type,
      subtitle: o.shape === "circle" ? "\u0422\u043E\u0447\u0435\u0447\u043D\u044B\u0439 \u043E\u0431\u044A\u0435\u043A\u0442" : `${o.size} \xB7 h ${o.hM} \u043C`,
      rightIcon: "chevron-right"
    }
  ))), selObj && selObj.shape !== "circle" && /* @__PURE__ */ React.createElement("div", { style: { padding: 18, borderTop: "1px solid var(--border-secondary-enabled)", background: "var(--neutral-10)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, selObj.type), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(SA.Button, { variant: edit ? "secondary" : "white", icon: edit ? "check" : "pen-line", size: "sm", onClick: () => setEdit((v) => !v) }, edit ? "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C" : "\u0413\u0430\u0431\u0430\u0440\u0438\u0442\u044B"), /* @__PURE__ */ React.createElement(SA.Button, { variant: "white", icon: "x", size: "sm", "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", onClick: () => {
    setSel(null);
    setEdit(false);
  }, style: { marginLeft: 8 } })), edit ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Field, { label: "\u0428\u0438\u0440\u0438\u043D\u0430, \u043C" }, /* @__PURE__ */ React.createElement(SA.Input, { size: "sm", defaultValue: selObj.size.split(" \xD7 ")[0] }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Field, { label: "\u0414\u043B\u0438\u043D\u0430, \u043C" }, /* @__PURE__ */ React.createElement(SA.Input, { size: "sm", defaultValue: (selObj.size.split(" \xD7 ")[1] || "").replace(" \u043C", "") })))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Field, { label: "\u0412\u044B\u0441\u043E\u0442\u0430, \u043C" }, /* @__PURE__ */ React.createElement(SA.Input, { size: "sm", defaultValue: String(selObj.hM) }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Field, { label: "\u0422\u0438\u043F" }, /* @__PURE__ */ React.createElement(SA.Input, { size: "sm", defaultValue: selObj.short })))), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, "\u0418\u043B\u0438 \u043F\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u0443\u0433\u043B\u043E\u0432\u044B\u0435 \u043C\u0430\u0440\u043A\u0435\u0440\u044B \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430 \u043F\u0440\u044F\u043C\u043E \u043D\u0430 \u043F\u043B\u0430\u043D\u0435.")) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 13 } }, /* @__PURE__ */ React.createElement(Prop, { k: "\u0422\u0438\u043F", v: selObj.short }), /* @__PURE__ */ React.createElement(Prop, { k: "\u0412\u044B\u0441\u043E\u0442\u0430", v: `${selObj.hM} \u043C` }), /* @__PURE__ */ React.createElement(Prop, { k: "\u0413\u0430\u0431\u0430\u0440\u0438\u0442\u044B", v: selObj.size }), /* @__PURE__ */ React.createElement(Prop, { k: "\u041A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B", v: `X ${Math.round(selObj.x / 6.6)}, Y ${Math.round(selObj.y / 6.6)} \u043C` })))), addOpen && /* @__PURE__ */ React.createElement(
    SA.Dialog,
    {
      title: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u043A\u0440\u043E\u0432\u043B\u0438",
      width: 460,
      onClose: () => {
        setAddOpen(false);
        setPicked(null);
      },
      footer: picked ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(SA.Button, { variant: "secondary", icon: "arrow-left", onClick: () => setPicked(null) }, "\u041D\u0430\u0437\u0430\u0434"), /* @__PURE__ */ React.createElement(SA.Button, { variant: "accent", icon: "pen-line", onClick: () => pickType(picked) }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043D\u0430 \u043F\u043B\u0430\u043D")) : null
    },
    !picked ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--content-tertiary-enabled)", marginBottom: 12 } }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430:"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, D.ELEMENT_TYPES.map((t) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: t.id,
        type: "button",
        onClick: () => setPicked(t.name),
        style: { display: "flex", alignItems: "center", gap: 10, width: "100%", border: "1px solid var(--border-secondary-enabled)", background: "#fff", padding: "12px 14px", borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left" },
        onMouseEnter: (e) => e.currentTarget.style.background = "var(--neutral-10)",
        onMouseLeave: (e) => e.currentTarget.style.background = "#fff"
      },
      /* @__PURE__ */ React.createElement(SA.Icon, { name: t.icon, size: 18, color: "var(--content-tertiary-enabled)" }),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, color: "var(--content-primary-a-enabled)" } }, t.name)
    )))) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 38, height: 38, borderRadius: 8, background: "var(--neutral-10)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(SA.Icon, { name: "box", size: 20, color: "var(--content-secondary-enabled)" })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, picked)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--content-tertiary-enabled)", marginBottom: 12 } }, "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0433\u0430\u0431\u0430\u0440\u0438\u0442\u044B \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430 \u2014 \u0437\u0430\u0442\u0435\u043C \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u0435\u0433\u043E \u043D\u0430 \u043F\u043B\u0430\u043D\u0435 \u043A\u0440\u043E\u0432\u043B\u0438."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Field, { label: "\u0428\u0438\u0440\u0438\u043D\u0430, \u043C" }, /* @__PURE__ */ React.createElement(SA.Input, { size: "sm", placeholder: "0,0" }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Field, { label: "\u0414\u043B\u0438\u043D\u0430, \u043C" }, /* @__PURE__ */ React.createElement(SA.Input, { size: "sm", placeholder: "0,0" }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(Field, { label: "\u0412\u044B\u0441\u043E\u0442\u0430, \u043C" }, /* @__PURE__ */ React.createElement(SA.Input, { size: "sm", placeholder: "0,0" })))))
  )));
}
function Toggle({ on, onClick }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick,
      style: { width: 38, height: 22, borderRadius: 999, border: "none", cursor: "pointer", padding: 2, background: on ? "var(--red-60)" : "var(--neutral-25)", transition: "background .15s" }
    },
    /* @__PURE__ */ React.createElement("span", { style: { display: "block", width: 18, height: 18, borderRadius: 999, background: "#fff", transform: on ? "translateX(16px)" : "translateX(0)", transition: "transform .15s" } })
  );
}
function Prop({ k, v }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, color: "var(--content-primary-a-enabled)" } }, v));
}
Object.assign(window, { StepUpload, StepRoof });

}); }

// ui_kits/snow/build/StepsB.jsx
try { (() => {
const SB = window.__lazyNS();
function FieldRow({ label, children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 600, color: "var(--content-secondary-enabled)", marginBottom: 6 } }, label), children);
}
function StepClimate() {
  const C = window.SNOW_DATA.CLIMATE;
  return /* @__PURE__ */ React.createElement(
    window.WorkArea,
    {
      panelWidth: 400,
      canvas: /* @__PURE__ */ React.createElement(window.RoofCanvas, { layers: { geometry: true, parapet: true, obstacles: true, north: true } }),
      panel: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", minHeight: 0, height: "100%", overflowY: "auto" } }, /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043A \u043C\u0435\u0441\u0442\u043D\u043E\u0441\u0442\u0438", action: /* @__PURE__ */ React.createElement(SB.Tag, { tone: "green", size: "sm", icon: "map-pin" }, "\u043F\u043E \u0430\u0434\u0440\u0435\u0441\u0443") }), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 20px 6px" } }, /* @__PURE__ */ React.createElement(FieldRow, { label: "\u0413\u043E\u0440\u043E\u0434 (\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0451\u043D \u043F\u043E \u0430\u0434\u0440\u0435\u0441\u0443)" }, /* @__PURE__ */ React.createElement(SB.Input, { icon: "building-2", defaultValue: "\u0415\u043A\u0430\u0442\u0435\u0440\u0438\u043D\u0431\u0443\u0440\u0433" })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(FieldRow, { label: "\u0421\u043D\u0435\u0433\u043E\u0432\u043E\u0439 \u0440\u0430\u0439\u043E\u043D (\u0421\u041F 20.13330.2016)" }, /* @__PURE__ */ React.createElement(SB.Select, { value: "3", options: [
        { id: "2", title: "II \xB7 1,2 \u043A\u041F\u0430" },
        { id: "3", title: "III \xB7 1,8 \u043A\u041F\u0430" },
        { id: "4", title: "IV \xB7 2,4 \u043A\u041F\u0430" },
        { id: "5", title: "V \xB7 3,0 \u043A\u041F\u0430" }
      ] })), /* @__PURE__ */ React.createElement(FieldRow, { label: "\u0412\u0435\u0442\u0440\u043E\u0432\u043E\u0439 \u0440\u0430\u0439\u043E\u043D" }, /* @__PURE__ */ React.createElement(SB.Select, { value: "2", options: [
        { id: "1", title: "I \xB7 0,23 \u043A\u041F\u0430" },
        { id: "2", title: "II \xB7 0,30 \u043A\u041F\u0430" },
        { id: "3", title: "III \xB7 0,38 \u043A\u041F\u0430" }
      ] })))), /* @__PURE__ */ React.createElement("div", { style: { margin: "4px 20px 16px", padding: "14px 16px", background: "var(--neutral-10)", borderRadius: "var(--radius-lg)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" } }, /* @__PURE__ */ React.createElement(Metric, { k: "\u0412\u0435\u0441 \u0441\u043D\u0435\u0433. \u043F\u043E\u043A\u0440\u043E\u0432\u0430, Sg", v: `${C.sg} \u043A\u041F\u0430`, sub: `${C.sgKg} \u043A\u0433/\u043C\xB2` }), /* @__PURE__ */ React.createElement(Metric, { k: "\u0412\u0435\u0442\u0440\u043E\u0432\u043E\u0435 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435, w\u2080", v: `${C.w0} \u043A\u041F\u0430`, sub: "\u0442\u0438\u043F \u043C\u0435\u0441\u0442\u043D\u043E\u0441\u0442\u0438 B" })), /* @__PURE__ */ React.createElement(window.PanelHead, { title: "\u041E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0438 \u0440\u043E\u0437\u0430 \u0432\u0435\u0442\u0440\u043E\u0432" }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, padding: "0 20px 20px", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(window.NorthArrow, { size: 84, deg: C.northDeg }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--content-secondary-enabled)" } }, "\u0421\u0435\u0432\u0435\u0440 ", C.northDeg, "\xB0")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-lg)", padding: 12, display: "flex", flexDirection: "column", alignItems: "center" } }, /* @__PURE__ */ React.createElement(window.WindRose, { size: 150, north: C.northDeg }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--content-tertiary-enabled)", marginTop: 4 } }, "\u041F\u0440\u0435\u043E\u0431\u043B\u0430\u0434\u0430\u044E\u0449\u0438\u0439 \u0432\u0435\u0442\u0435\u0440 \u2014 ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--red-60)" } }, "\u0417, \u042E\u0417")))), /* @__PURE__ */ React.createElement("div", { style: { margin: "0 20px 20px", padding: "12px 16px", background: "var(--blue-10)", borderRadius: "var(--radius-md)", display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement(SB.Icon, { name: "wind", size: 18, color: "var(--blue-60)" }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--blue-65)", lineHeight: 1.45 } }, "\u0421\u043D\u0435\u0433\u043E\u0432\u044B\u0435 \u043C\u0435\u0448\u043A\u0438 \u0444\u043E\u0440\u043C\u0438\u0440\u0443\u044E\u0442\u0441\u044F \u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E \u0441 \u043F\u043E\u0434\u0432\u0435\u0442\u0440\u0435\u043D\u043D\u043E\u0439 (\u0432\u043E\u0441\u0442\u043E\u0447\u043D\u043E\u0439) \u0441\u0442\u043E\u0440\u043E\u043D\u044B \u043F\u0440\u0435\u043F\u044F\u0442\u0441\u0442\u0432\u0438\u0439 \u0438 \u043F\u0430\u0440\u0430\u043F\u0435\u0442\u043E\u0432.")))
    }
  );
}
function Metric({ k, v, sub }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: "var(--content-primary-a-enabled)", lineHeight: 1.2 } }, v), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, sub));
}
function StepBagsSensors() {
  const D = window.SNOW_DATA;
  const [tab, setTab] = React.useState("bags");
  const [zone, setZone] = React.useState(null);
  const [sensor, setSensor] = React.useState(null);
  const bags = D.SNOWBAGS;
  const onSelect = (id) => {
    if (/^Z/.test(id)) {
      setTab("bags");
      setZone((z) => z === id ? null : id);
    } else {
      setTab("sensors");
      setSensor(id);
    }
  };
  const selId = tab === "bags" ? zone : sensor;
  return /* @__PURE__ */ React.createElement(
    window.WorkArea,
    {
      panelWidth: 400,
      canvas: /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 } }, /* @__PURE__ */ React.createElement(window.RoofCanvas, { layers: { geometry: true, parapet: true, obstacles: true, bags: true, sensors: true, north: true, sensorDims: tab === "sensors" && !!sensor }, selectedId: selId, onSelect }), /* @__PURE__ */ React.createElement(Legend, null)),
      panel: /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", minHeight: 0, height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 20px 10px" } }, /* @__PURE__ */ React.createElement(
        SB.Tabs,
        {
          variant: "segmented",
          value: tab,
          options: [{ id: "bags", name: "\u0421\u043D\u0435\u0433\u043E\u0432\u044B\u0435 \u043C\u0435\u0448\u043A\u0438", secondaryText: bags.length, icon: "snowflake" }, { id: "sensors", name: "\u0414\u0430\u0442\u0447\u0438\u043A\u0438", secondaryText: D.SENSORS.length, icon: "radio" }],
          onChange: setTab
        }
      )), tab === "bags" ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", minHeight: 0, flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, padding: "0 20px 12px" } }, /* @__PURE__ */ React.createElement(Chip, { tone: "red", n: D.METRICS.risk.critical, t: "\u043A\u0440\u0438\u0442\u0438\u0447." }), /* @__PURE__ */ React.createElement(Chip, { tone: "orange", n: D.METRICS.risk.high, t: "\u0432\u044B\u0441\u043E\u043A\u0438\u0445" }), /* @__PURE__ */ React.createElement(Chip, { tone: "yellow", n: D.METRICS.risk.medium, t: "\u0441\u0440\u0435\u0434\u043D\u0438\u0445" })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 } }, bags.map((z) => /* @__PURE__ */ React.createElement(BagCard, { key: z.id, z, on: zone === z.id, onClick: () => setZone(zone === z.id ? null : z.id) })))) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", minHeight: 0, flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, padding: "0 20px 14px" } }, /* @__PURE__ */ React.createElement(StatBox, { v: `${D.METRICS.coverage}%`, k: "\u043F\u043E\u043A\u0440\u044B\u0442\u0438\u0435 \u0437\u043E\u043D" }), /* @__PURE__ */ React.createElement(StatBox, { v: "18,5 \u043C", k: "\u0441\u0440. \u0448\u0430\u0433 \u0441\u0435\u0442\u043A\u0438" }), /* @__PURE__ */ React.createElement(StatBox, { v: "3,0 \u043C", k: "\u0434\u043E \u043F\u0430\u0440\u0430\u043F\u0435\u0442\u0430" })), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 20px 12px" } }, /* @__PURE__ */ React.createElement(SB.Button, { variant: "white", size: "sm", icon: "plus", block: true }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0434\u0430\u0442\u0447\u0438\u043A")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "0 12px" } }, D.SENSORS.map((s) => {
        const z = D.SNOWBAGS.find((b) => b.id === s.zone);
        const m = z ? window.RISK_META[z.risk] : null;
        return /* @__PURE__ */ React.createElement(
          SB.Cell,
          {
            key: s.id,
            selected: s.id === sensor,
            onClick: () => setSensor(s.id),
            leftIcon: "radio",
            title: `\u0414\u0430\u0442\u0447\u0438\u043A ${s.id}`,
            subtitle: z ? `\u0417\u043E\u043D\u0430 ${z.id} \xB7 ${z.name}` : "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F \u0442\u043E\u0447\u043A\u0430",
            rightSlot: m ? /* @__PURE__ */ React.createElement(SB.Tag, { tone: m.tone, size: "sm" }, z.load, " \u043A\u041F\u0430") : /* @__PURE__ */ React.createElement(SB.Tag, { tone: "neutral", size: "sm" }, "\u043D\u043E\u0440\u043C\u0430")
          }
        );
      })), sensor && (() => {
        const s = D.SENSORS.find((x) => x.id === sensor);
        return /* @__PURE__ */ React.createElement("div", { style: { padding: 18, borderTop: "1px solid var(--border-secondary-enabled)", background: "var(--neutral-10)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } }, /* @__PURE__ */ React.createElement(SB.Icon, { name: "move", size: 16, color: "var(--content-accent-enabled)" }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, "\u041F\u0435\u0440\u0435\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0434\u0430\u0442\u0447\u0438\u043A\u0430 ", s.id), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(SB.Button, { variant: "white", icon: "x", size: "sm", "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", onClick: () => setSensor(null) })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--content-tertiary-enabled)", lineHeight: 1.45, display: "block", marginBottom: 10 } }, "\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0434\u043E \u043F\u0430\u0440\u0430\u043F\u0435\u0442\u043E\u0432 \u0438 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0433\u043E \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430 \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u043D\u0430 \u043F\u043B\u0430\u043D\u0435. \u0417\u0430\u0434\u0430\u0439\u0442\u0435 \u0442\u043E\u0447\u043D\u043E\u0435 \u0440\u0430\u0441\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0442\u043E\u0447\u043A\u0443."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(FieldRow, { label: "X, \u043C" }, /* @__PURE__ */ React.createElement(SB.Input, { size: "sm", defaultValue: String(Math.round(s.x / 6.6)) }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(FieldRow, { label: "Y, \u043C" }, /* @__PURE__ */ React.createElement(SB.Input, { size: "sm", defaultValue: String(Math.round(s.y / 6.6)) })))), /* @__PURE__ */ React.createElement(SB.Button, { variant: "secondary", size: "sm", icon: "check", block: true, onClick: () => setSensor(null) }, "\u0417\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u0442\u044C"));
      })()))
    }
  );
}
function BagCard({ z, on, onClick }) {
  const m = window.RISK_META[z.risk];
  return /* @__PURE__ */ React.createElement("button", { type: "button", onClick, style: { textAlign: "left", border: `1px solid ${on ? m.line : "var(--border-secondary-enabled)"}`, borderLeft: `4px solid ${m.fill}`, borderRadius: "var(--radius-md)", background: on ? m.soft : "#fff", padding: "12px 14px", cursor: "pointer", transition: "all .12s" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 800, color: m.line } }, z.id), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600, color: "var(--content-primary-a-enabled)" } }, z.name), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(SB.Tag, { tone: m.tone, size: "sm" }, m.label)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 18, marginBottom: 6 } }, /* @__PURE__ */ React.createElement(Mini, { k: "\u041A\u043E\u044D\u0444. \u03BC", v: z.mu.toLocaleString("ru") }), /* @__PURE__ */ React.createElement(Mini, { k: "\u041D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 S", v: `${z.load} \u043A\u041F\u0430` }), /* @__PURE__ */ React.createElement(Mini, { k: "\u041F\u043B\u043E\u0449\u0430\u0434\u044C", v: `${z.area} \u043C\xB2` })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--content-tertiary-enabled)", display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(SB.Icon, { name: "info", size: 13, color: "var(--content-tertiary-enabled)" }), "\u041E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u0435: ", z.basis));
}
function Mini({ k, v }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--content-tertiary-enabled)" } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, v));
}
function Chip({ tone, n, t }) {
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", borderRadius: "var(--radius-md)", background: `var(--${tone}-10)` } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 17, fontWeight: 800, color: `var(--${tone}-${tone === "yellow" ? 40 : 60})` } }, n), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--content-secondary-enabled)" } }, t));
}
function Legend() {
  const items = [["critical", "\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F"], ["high", "\u0412\u044B\u0441\u043E\u043A\u0430\u044F"], ["medium", "\u0421\u0440\u0435\u0434\u043D\u044F\u044F"]];
  return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 24, bottom: 20, display: "flex", gap: 14, background: "rgba(255,255,255,.92)", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-md)", padding: "8px 14px", backdropFilter: "blur(2px)" } }, items.map(([r, l]) => /* @__PURE__ */ React.createElement("div", { key: r, style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 12, height: 12, borderRadius: 3, background: window.RISK_META[r].fill, opacity: 0.7 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--content-secondary-enabled)" } }, l))), /* @__PURE__ */ React.createElement("div", { style: { width: 1, background: "var(--border-secondary-enabled)" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 11, height: 11, borderRadius: 999, background: "var(--red-60)", border: "2px solid #fff", boxShadow: "0 0 0 1px var(--red-60)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--content-secondary-enabled)" } }, "\u0414\u0430\u0442\u0447\u0438\u043A")));
}
function StatBox({ v, k }) {
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, background: "var(--neutral-10)", borderRadius: "var(--radius-md)", padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: "var(--content-primary-a-enabled)" } }, v), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--content-tertiary-enabled)" } }, k));
}
Object.assign(window, { StepClimate, StepBagsSensors });

}); }

// ui_kits/snow/build/app.jsx
try { (() => {
const AppIcon = window.__lazyTN("Icon");
const CALC_STEPS = [
  "\u0410\u043D\u0430\u043B\u0438\u0437 \u0433\u0435\u043E\u043C\u0435\u0442\u0440\u0438\u0438 \u043A\u0440\u043E\u0432\u043B\u0438 \u0438 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432",
  "\u0420\u0430\u0441\u0447\u0451\u0442 \u043A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442\u043E\u0432 \u03BC \u043F\u043E \u0421\u041F 20.13330.2016",
  "\u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0437\u043E\u043D \u0441\u043D\u0435\u0433\u043E\u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u044F",
  "\u041F\u043E\u0434\u0431\u043E\u0440 \u0440\u0430\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438 \u0434\u0430\u0442\u0447\u0438\u043A\u043E\u0432"
];
function Calculating({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [pct, setPct] = React.useState(5);
  React.useEffect(() => {
    const t1 = setInterval(() => setPct((p) => Math.min(100, p + 4)), 90);
    const t2 = setInterval(() => setStep((s) => Math.min(CALC_STEPS.length - 1, s + 1)), 760);
    const done = setTimeout(onDone, 3100);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearTimeout(done);
    };
  }, []);
  return /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--neutral-10)" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 480, background: "#fff", border: "1px solid var(--border-secondary-enabled)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-large)", padding: 28 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 13, marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--red-10)", borderRadius: "var(--radius-md)" } }, /* @__PURE__ */ React.createElement(AppIcon, { name: "snowflake", size: 24, color: "var(--content-accent-enabled)" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 700, color: "var(--content-primary-a-enabled)" } }, "\u0418\u0434\u0451\u0442 \u0440\u0430\u0441\u0447\u0451\u0442 \u0441\u043D\u0435\u0433\u043E\u0432\u044B\u0445 \u043C\u0435\u0448\u043A\u043E\u0432"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--content-tertiary-enabled)" } }, "\u041E\u0431\u044A\u0435\u043A\u0442 \xAB\u0421\u0435\u0432\u0435\u0440-2\xBB \xB7 8 240 \u043C\xB2"))), /* @__PURE__ */ React.createElement("div", { style: { height: 6, background: "var(--background-tertiary-enabled)", borderRadius: 999, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${pct}%`, height: "100%", background: "var(--background-accent-enabled)", borderRadius: 999, transition: "width .2s linear" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 11, marginTop: 20 } }, CALC_STEPS.map((s, i) => {
    const done = i < step, cur = i === step;
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 11 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, background: done ? "var(--green-10)" : cur ? "var(--red-10)" : "var(--background-secondary-a-enabled)" } }, done ? /* @__PURE__ */ React.createElement(AppIcon, { name: "check", size: 14, color: "var(--content-system-positive)" }) : cur ? /* @__PURE__ */ React.createElement(AppIcon, { name: "loader-circle", size: 14, color: "var(--content-accent-enabled)", style: { animation: "tn-spin .7s linear infinite" } }) : /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: 999, background: "var(--neutral-35)" } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: done || cur ? "var(--content-primary-a-enabled)" : "var(--content-tertiary-enabled)" } }, s));
  }))), /* @__PURE__ */ React.createElement("style", null, `@keyframes tn-spin{to{transform:rotate(360deg)}}`));
}
const DEMO_UPLOAD = {
  files: [
    { name: "\u041A\u0440\u043E\u0432\u043B\u044F_\u0421\u0435\u0432\u0435\u0440-2.pdf", size: "2,4 \u041C\u0411", desc: "\u043F\u043B\u0430\u043D \u043A\u0440\u043E\u0432\u043B\u0438", selected: true },
    { name: "\u0420\u0430\u0437\u0440\u0435\u0437_\u043F\u0430\u0440\u0430\u043F\u0435\u0442.dwg", size: "0,8 \u041C\u0411", desc: "\u0443\u0437\u0435\u043B \u043F\u0430\u0440\u0430\u043F\u0435\u0442\u0430" }
  ],
  scale: "1:200",
  mapAddress: "\u0433. \u0415\u043A\u0430\u0442\u0435\u0440\u0438\u043D\u0431\u0443\u0440\u0433, \u0421\u0438\u0431\u0438\u0440\u0441\u043A\u0438\u0439 \u0442\u0440\u0430\u043A\u0442, 12",
  mapSelected: true
};
const EMPTY_UPLOAD = { files: [], scale: null, mapAddress: "", mapSelected: false };
function App() {
  const D = window.SNOW_DATA;
  const STEPS = D.STEPS;
  const [route, setRoute] = React.useState("projects");
  const [step, setStep] = React.useState(0);
  const [maxReached, setMax] = React.useState(0);
  const [calc, setCalc] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);
  const [isNewProject, setIsNewProject] = React.useState(false);
  const [upload, setUpload] = React.useState(EMPTY_UPLOAD);
  const goStep = (i) => {
    setStep(i);
    setMax((m) => Math.max(m, i));
  };
  const openExisting = () => {
    setIsNewProject(false);
    setUpload(DEMO_UPLOAD);
    setRoute("wizard");
    setStep(0);
    setMax(STEPS.length - 1);
  };
  const openNew = () => {
    setIsNewProject(true);
    setUpload(EMPTY_UPLOAD);
    setRoute("wizard");
    setStep(0);
    setMax(0);
  };
  function addFile(file) {
    setUpload((u) => ({
      ...u,
      files: [...u.files.map((f) => ({ ...f, selected: false })), file],
      scale: /\.pdf$/i.test(file.name) ? "1:200" : u.scale
    }));
  }
  function selectMap(address) {
    setUpload((u) => ({ ...u, mapAddress: address, mapSelected: true }));
  }
  const next = () => {
    const id = STEPS[step].id;
    if (id === "climate") {
      setCalc(true);
      return;
    }
    if (step < STEPS.length - 1) goStep(step + 1);
  };
  const back = () => {
    if (step > 0) goStep(step - 1);
  };
  let stepContent = null;
  if (calc) {
    stepContent = /* @__PURE__ */ React.createElement(Calculating, { onDone: () => {
      setCalc(false);
      goStep(3);
    } });
  } else {
    const id = STEPS[step].id;
    stepContent = {
      upload: /* @__PURE__ */ React.createElement(
        window.StepUpload,
        {
          isNew: isNewProject,
          files: upload.files,
          scale: upload.scale,
          mapAddress: upload.mapAddress,
          mapSelected: upload.mapSelected,
          onFileAdd: addFile,
          onMapSelect: selectMap
        }
      ),
      roof: /* @__PURE__ */ React.createElement(window.StepRoof, null),
      climate: /* @__PURE__ */ React.createElement(window.StepClimate, null),
      bags: /* @__PURE__ */ React.createElement(window.StepBagsSensors, null),
      result: /* @__PURE__ */ React.createElement(window.ResultView, { onExport: () => setShowExport(true) })
    }[id];
  }
  const footerCfg = (() => {
    const id = STEPS[step].id;
    if (id === "climate") return { nextLabel: "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044C \u043C\u0435\u0448\u043A\u0438", nextIcon: "sparkles", nextVariant: "accent", hint: "\u0420\u0430\u0441\u0447\u0451\u0442 \u043F\u043E \u0421\u041F 20.13330.2016" };
    if (id === "bags") return { nextLabel: "\u0421\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0445\u0435\u043C\u0443", nextIcon: "arrow-right", nextVariant: "accent" };
    if (id === "result") return { nextLabel: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432", nextIcon: "download", nextVariant: "accent", onNext: () => setShowExport(true) };
    if (id === "roof") return { nextLabel: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0438 \u0434\u0430\u043B\u0435\u0435", nextIcon: "arrow-right" };
    return {};
  })();
  if (route === "projects") {
    return /* @__PURE__ */ React.createElement(Frame, { project: null, onHome: () => setRoute("projects") }, /* @__PURE__ */ React.createElement(window.ProjectsView, { onOpen: openExisting, onNew: openNew }));
  }
  return /* @__PURE__ */ React.createElement(Frame, { project: isNewProject ? null : D.PROJECT, onHome: () => setRoute("projects") }, /* @__PURE__ */ React.createElement(window.Stepper, { steps: STEPS, current: step, maxReached, onJump: goStep }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } }, stepContent), !calc && /* @__PURE__ */ React.createElement(
    window.WizardFooter,
    {
      current: step,
      total: STEPS.length,
      onBack: back,
      onNext: footerCfg.onNext || next,
      nextLabel: footerCfg.nextLabel,
      nextIcon: footerCfg.nextIcon,
      nextVariant: footerCfg.nextVariant,
      hint: footerCfg.hint,
      onDraft: () => setRoute("projects")
    }
  ), showExport && /* @__PURE__ */ React.createElement(window.ExportDialog, { onClose: () => setShowExport(false) }));
}
function Frame({ project, onHome, children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--neutral-10)" } }, /* @__PURE__ */ React.createElement(window.AppHeader, { project, onHome }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } }, children));
}
class Boundary extends React.Component {
  constructor(p) {
    super(p);
    this.state = { err: false };
  }
  static getDerivedStateFromError() {
    return { err: true };
  }
  componentDidCatch() {
  }
  render() {
    return this.state.err ? null : this.props.children;
  }
}
(function boot() {
  console.log("SNOW-BUILD-v3");
  var ns = window.TNDesignSystem_7f9df2;
  if (!ns || !ns.Button || !ns.Icon || !window.AppHeader || !window.ProjectsView) {
    return setTimeout(boot, 30);
  }
  var rootEl = document.getElementById("root");
  if (!rootEl) return;
  if (!window.__snowRoot) window.__snowRoot = ReactDOM.createRoot(rootEl);
  window.__snowRoot.render(/* @__PURE__ */ React.createElement(Boundary, null, /* @__PURE__ */ React.createElement(App, null)));
})();

}); }

// ui_kits/snow/build/data.js
try { (() => {
// «Снеговые мешки» — демоданные прототипа.
// Геометрия задана в системе координат SVG viewBox 1000 × 680 (план кровли сверху).
window.SNOW_DATA = (function () {
  // ---------- Объект / проект ----------
  const PROJECT = {
    name: "ЛК «Север-2»",
    type: "Логистический комплекс, складской корпус",
    address: "г. Екатеринбург, Сибирский тракт, 12",
    customer: "ООО «Северная логистика»",
    area: "8 240",            // м²
    roofType: "Плоская, рулонная (ПВХ-мембрана)",
    parapet: "600 мм",
    norm: "СП 20.13330.2016 (изм. № 6)",
    number: "КИСО-2024-0185",
    calcNo: "РС-2025-0042",
    updated: "Сегодня, 14:32",
    author: "Громов А. И.",
  };

  // ---------- Контур кровли (внешний) ----------
  // L-образная кровля: верхний прямоугольник + крыло вниз-влево.
  const ROOF = [
    [90, 90], [910, 90], [910, 440], [560, 440], [560, 590], [90, 590],
  ];

  // ---------- Препятствия ----------
  const OBSTACLES = [
    { id: "shaft-1", type: "Лестнично-лифтовая надстройка", short: "Надстройка", shape: "rect", x: 690, y: 150, w: 150, h: 110, hM: 3.6, size: "23,0 × 16,8 м" },
    { id: "vent-1", type: "Вентиляционная установка", short: "Вентустановка", shape: "rect", x: 360, y: 150, w: 130, h: 74, hM: 2.4, size: "19,7 × 11,2 м" },
    { id: "unit-1", type: "Технический блок (ИТП)", short: "Техблок", shape: "rect", x: 640, y: 312, w: 96, h: 62, hM: 1.8, size: "14,5 × 9,4 м" },
    { id: "sky-1", type: "Зенитный фонарь", short: "Фонарь", shape: "rect", x: 160, y: 300, w: 240, h: 60, hM: 0.9, size: "36,4 × 9,1 м" },
    { id: "drain-1", type: "Водосточная воронка", short: "Воронка", shape: "circle", cx: 150, cy: 560, r: 9 },
    { id: "drain-2", type: "Водосточная воронка", short: "Воронка", shape: "circle", cx: 470, cy: 560, r: 9 },
    { id: "drain-3", type: "Водосточная воронка", short: "Воронка", shape: "circle", cx: 760, cy: 160, r: 9 },
    { id: "drain-4", type: "Водосточная воронка", short: "Воронка", shape: "circle", cx: 880, cy: 410, r: 9 },
    { id: "drain-5", type: "Водосточная воронка", short: "Воронка", shape: "circle", cx: 300, cy: 150, r: 9 },
  ];

  // Пешеходная дорожка обслуживания (маршрут вдоль оси)
  const WALKWAY = [[120, 430], [520, 430], [520, 560]];

  // Справочник типов элементов кровли (для добавления)
  const ELEMENT_TYPES = [
    { id: "vent", icon: "box", name: "Вентиляционная установка" },
    { id: "shaft", icon: "box", name: "Лестнично-лифтовая надстройка" },
    { id: "sky", icon: "box", name: "Зенитный фонарь" },
    { id: "unit", icon: "box", name: "Технический блок" },
    { id: "cabinet", icon: "box", name: "Щиток системы мониторинга" },
    { id: "basket", icon: "box", name: "Корзина системы мониторинга" },
    { id: "drain", icon: "circle-dot", name: "Водосточная воронка" },
    { id: "parapet", icon: "frame", name: "Парапет" },
    { id: "walkway", icon: "spline", name: "Пешеходная дорожка" },
  ];

  // ---------- Снеговые мешки ----------
  // risk: critical | high | medium  → red / orange / yellow (по семантике TN)
  const SNOWBAGS = [
    { id: "Z1", name: "Входящий угол", basis: "Геометрия: вогнутый угол кровли", poly: [[470, 440], [560, 440], [560, 545], [470, 545]], mu: 3.2, load: "4,03", area: 210, risk: "critical" },
    { id: "Z2", name: "За надстройкой", basis: "Подветренная зона за надстройкой 3,6 м", poly: [[690, 260], [840, 260], [840, 332], [690, 332]], mu: 2.6, load: "3,28", area: 180, risk: "critical" },
    { id: "Z3", name: "За вентустановкой", basis: "Подветренная зона за установкой 2,4 м", poly: [[360, 224], [490, 224], [490, 292], [360, 292]], mu: 2.2, load: "2,77", area: 145, risk: "high" },
    { id: "Z4", name: "Подветренный парапет (юг)", basis: "Снос снега к парапету, μ по п. 10.4", poly: [[100, 538], [552, 538], [552, 582], [100, 582]], mu: 1.8, load: "2,27", area: 320, risk: "high" },
    { id: "Z5", name: "За зенитным фонарём", basis: "Подветренная зона за фонарём", poly: [[160, 362], [400, 362], [400, 408], [160, 408]], mu: 1.6, load: "2,02", area: 165, risk: "medium" },
    { id: "Z6", name: "Парапет (запад)", basis: "Снос снега к западному парапету", poly: [[100, 100], [148, 100], [148, 520], [100, 520]], mu: 1.4, load: "1,76", area: 160, risk: "medium" },
  ];

  // ---------- Датчики снеговой нагрузки ----------
  // Привязка к зоне; координаты в системе плана.
  const SENSORS = [
    { id: "Д-01", x: 512, y: 492, zone: "Z1" },
    { id: "Д-02", x: 498, y: 458, zone: "Z1" },
    { id: "Д-03", x: 762, y: 296, zone: "Z2" },
    { id: "Д-04", x: 812, y: 300, zone: "Z2" },
    { id: "Д-05", x: 410, y: 256, zone: "Z3" },
    { id: "Д-06", x: 452, y: 276, zone: "Z3" },
    { id: "Д-07", x: 205, y: 560, zone: "Z4" },
    { id: "Д-08", x: 330, y: 560, zone: "Z4" },
    { id: "Д-09", x: 458, y: 560, zone: "Z4" },
    { id: "Д-10", x: 222, y: 386, zone: "Z5" },
    { id: "Д-11", x: 342, y: 386, zone: "Z5" },
    { id: "Д-12", x: 124, y: 210, zone: "Z6" },
    { id: "Д-13", x: 124, y: 392, zone: "Z6" },
    { id: "Д-14", x: 878, y: 300, zone: null },
  ];

  // ---------- Климат / привязка ----------
  const CLIMATE = {
    city: "Екатеринбург",
    snowRegion: "III",
    sg: "1,8",            // кПа, расчётный вес снегового покрова
    sgKg: "184",          // кг/м²
    windRegion: "II",
    w0: "0,30",           // кПа
    terrain: "B",
    norm: "СП 20.13330.2016 (изм. № 6)",
    northDeg: -18,        // поворот севера относительно вертикали, по часовой
  };

  // Роза ветров (повторяемость, %), 8 румбов от С по часовой
  const WINDROSE = [
    { dir: "С", deg: 0, v: 8 },
    { dir: "СВ", deg: 45, v: 7 },
    { dir: "В", deg: 90, v: 9 },
    { dir: "ЮВ", deg: 135, v: 11 },
    { dir: "Ю", deg: 180, v: 13 },
    { dir: "ЮЗ", deg: 225, v: 19 },
    { dir: "З", deg: 270, v: 21 },
    { dir: "СЗ", deg: 315, v: 12 },
  ];

  // ---------- Итоговые метрики ----------
  const METRICS = {
    roofArea: "8 240",
    bagsArea: "1 180",
    bagsShare: "14,3",
    sensors: 14,
    coverage: "96",
    maxLoad: "4,03",
    risk: { critical: 2, high: 2, medium: 2 },
  };

  // Спецификация оборудования
  const SPEC = [
    { pos: 1, name: "Датчик снеговой нагрузки ТН-СНЕГ-200", unit: "шт.", qty: 14, note: "Тензометрический, IP67" },
    { pos: 2, name: "Базовая станция сбора данных ТН-ХАБ-С", unit: "шт.", qty: 1, note: "LoRaWAN, 4G" },
    { pos: 3, name: "Щиток системы мониторинга ЩСМ-1", unit: "шт.", qty: 1, note: "IP65, ввод 220 В" },
    { pos: 4, name: "Корзина системы мониторинга КСМ-1", unit: "шт.", qty: 1, note: "Защита оборудования" },
    { pos: 5, name: "Кабель сигнальный, экранированный", unit: "м", qty: 320, note: "—" },
  ];

  // ---------- Недавние проекты (дашборд) ----------
  const PROJECTS = [
    { name: "ЛК «Север-2»", number: "КИСО-2024-0185", calcNo: "РС-2025-0042", customer: "ООО «Северная логистика»", calcs: 3, city: "Екатеринбург", area: "8 240", sensors: 14, status: "Черновик", tone: "neutral", created: "12 июня 2025", current: true },
    { name: "ТРЦ «Гранат»", number: "КИСО-2024-0177", calcNo: "РС-2025-0038", customer: "АО «Гранат-Девелопмент»", calcs: 2, city: "Казань", area: "22 100", sensors: 31, status: "Готово", tone: "green", created: "28 мая 2025" },
    { name: "Склад № 7 · Уралхим", number: "КИСО-2024-0162", calcNo: "РС-2025-0029", customer: "ПАО «Уралхим»", calcs: 1, city: "Пермь", area: "5 600", sensors: 9, status: "Готово", tone: "green", created: "14 мая 2025" },
    { name: "Производственный корпус А", number: "КИСО-2024-0151", calcNo: "РС-2025-0024", customer: "ООО «ЧелябСтройКомплект»", calcs: 1, city: "Челябинск", area: "11 480", sensors: 0, status: "Черновик", tone: "neutral", created: "30 апреля 2025" },
    { name: "Логопарк «Восточный»", number: "КИСО-2024-0140", calcNo: "РС-2025-0019", customer: "ООО «Восточный логистический парк»", calcs: 4, city: "Тюмень", area: "16 900", sensors: 24, status: "Готово", tone: "green", created: "21 апреля 2025" },
  ];

  // История расчётов объекта (к одному КИСО — несколько расчётов)
  const CALC_HISTORY = [
    { no: "РС-2025-0042", date: "12 июня 2025", author: "Громов А. И.", status: "Черновик", tone: "neutral", current: true },
    { no: "РС-2025-0021", date: "3 марта 2025", author: "Громов А. И.", status: "Готово", tone: "green" },
    { no: "РС-2024-0188", date: "28 ноября 2024", author: "Лебедев П. С.", status: "Готово", tone: "green" },
  ];

  // Шаги мастера
  const STEPS = [
    { id: "upload", n: 1, label: "Загрузка данных", icon: "upload" },
    { id: "roof", n: 2, label: "Геометрия и элементы", icon: "scan-line" },
    { id: "climate", n: 3, label: "Ориентация и климат", icon: "compass" },
    { id: "bags", n: 4, label: "Мешки и датчики", icon: "snowflake" },
    { id: "result", n: 5, label: "Результат", icon: "file-check-2" },
  ];

  return { PROJECT, ROOF, OBSTACLES, WALKWAY, SNOWBAGS, SENSORS, CLIMATE, WINDROSE, METRICS, SPEC, PROJECTS, STEPS, ELEMENT_TYPES, CALC_HISTORY };
})();

}); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Cell = __ds_scope.Cell;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.EmptyContent = __ds_scope.EmptyContent;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Search = __ds_scope.Search;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Breadcrumbs = __ds_scope.Breadcrumbs;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
