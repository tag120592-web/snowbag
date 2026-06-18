import { ReactNode, CSSProperties } from "react";

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  style?: CSSProperties;
}

export function Tooltip(props: TooltipProps): JSX.Element;
