import { CSSProperties } from "react";

export interface ProgressBarProps {
  value?: number;
  max?: number;
  tone?: "accent" | "positive" | "warning" | "action";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  indeterminate?: boolean;
  style?: CSSProperties;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element;
