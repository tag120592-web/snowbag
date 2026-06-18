import { CSSProperties } from "react";

export interface IconProps {
  /** Lucide icon name (substitute for the TN sprite's IconNames). */
  name?: string;
  /** Pixel size or any CSS length. Default 24. */
  size?: number | string;
  /** Any CSS color; defaults to currentColor so it inherits text color. */
  color?: string;
  style?: CSSProperties;
  className?: string;
}

export function Icon(props: IconProps): JSX.Element;
