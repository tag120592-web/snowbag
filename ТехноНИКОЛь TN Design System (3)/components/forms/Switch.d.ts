import { CSSProperties } from "react";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  style?: CSSProperties;
}

export function Switch(props: SwitchProps): JSX.Element;
