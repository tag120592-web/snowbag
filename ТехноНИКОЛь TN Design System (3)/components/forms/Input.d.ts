import { CSSProperties, InputHTMLAttributes } from "react";

/**
 * TN text input with label, status and icons.
 *
 * @startingPoint section="Forms" subtitle="Text field with label / error / icons" viewport="700x180"
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Leading Lucide icon name. */
  icon?: string;
  /** Trailing Lucide icon name. */
  iconRight?: string;
  /** Error message — turns the field red. */
  error?: string;
  /** Warning message — turns the field orange. */
  warn?: string;
  /** Neutral helper text below the field. */
  hint?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
