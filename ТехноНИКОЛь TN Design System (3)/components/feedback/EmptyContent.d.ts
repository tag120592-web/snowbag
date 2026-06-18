import { ReactNode, CSSProperties } from "react";

export interface EmptyContentProps {
  /** Lucide icon name. */
  icon?: string;
  title?: string;
  description?: string;
  /** Action node (e.g. a Button). */
  action?: ReactNode;
  style?: CSSProperties;
}

export function EmptyContent(props: EmptyContentProps): JSX.Element;
