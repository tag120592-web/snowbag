import { ReactNode, CSSProperties } from "react";

export interface BadgeProps {
  /** Numeric count (ignored when `dot`). */
  count?: number;
  /** Render a small dot instead of a count. */
  dot?: boolean;
  tone?: "red" | "neutral" | "green" | "blue";
  /** Cap displayed number, e.g. 99 → "99+". */
  max?: number;
  /** Wrap a target to anchor the badge to its top-right corner. */
  children?: ReactNode;
  style?: CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
