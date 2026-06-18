import { ReactNode, CSSProperties } from "react";

/**
 * TN tag / status chip.
 *
 * @startingPoint section="Data display" subtitle="Tag — tones, solid, removable" viewport="700x140"
 */
export interface TagProps {
  children?: ReactNode;
  /** Color family. */
  tone?: "neutral" | "red" | "green" | "blue" | "orange" | "yellow" | "purple";
  size?: "sm" | "md";
  /** Leading Lucide icon name. */
  icon?: string;
  /** Filled (solid) instead of soft tint. */
  solid?: boolean;
  /** Show a ✕ remove control. */
  removable?: boolean;
  onRemove?: () => void;
  style?: CSSProperties;
}

export function Tag(props: TagProps): JSX.Element;
