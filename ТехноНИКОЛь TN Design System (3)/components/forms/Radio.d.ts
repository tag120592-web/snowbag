import { CSSProperties } from "react";

export interface RadioProps {
  checked?: boolean;
  defaultChecked?: boolean;
  name?: string;
  value?: string | number | boolean;
  label?: string;
  description?: string;
  disabled?: boolean;
  onChange?: (value: string | number | boolean) => void;
  style?: CSSProperties;
}

export function Radio(props: RadioProps): JSX.Element;
