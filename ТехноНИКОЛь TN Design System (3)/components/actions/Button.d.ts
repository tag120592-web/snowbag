import { ReactNode, CSSProperties, ButtonHTMLAttributes } from "react";

/**
 * TN primary action button.
 *
 * @startingPoint section="Actions" subtitle="Button — all variants & sizes" viewport="700x200"
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  /** Visual style. `primary` = dark, `accent` = brand red, plus secondary/white/outline/link. */
  variant?: "primary" | "accent" | "secondary" | "white" | "outline" | "link";
  /** Control height. Default `md`. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Leading Lucide icon name. Omit children for an icon-only button. */
  icon?: string;
  /** Trailing Lucide icon name. */
  iconRight?: string;
  /** Stretch to full width. */
  block?: boolean;
  /** Pill (fully rounded) shape. */
  rounded?: boolean;
  /** Show a spinner and disable. */
  loading?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
