import { ReactNode, CSSProperties, HTMLAttributes } from "react";

export interface CellProps extends HTMLAttributes<HTMLDivElement> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Leading Lucide icon name. */
  leftIcon?: string;
  /** Custom leading content (e.g. an Avatar) — overrides leftIcon. */
  leftSlot?: ReactNode;
  rightText?: ReactNode;
  rightIcon?: string;
  rightSlot?: ReactNode;
  /** Render title in brand red. */
  accent?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Cell(props: CellProps): JSX.Element;
