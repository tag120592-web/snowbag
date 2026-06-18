import { CSSProperties } from "react";

export type SelectOption = { id: string | number; title: string } | { value: string | number; label: string } | string;

export interface SelectProps {
  label?: string;
  value?: string | number;
  placeholder?: string;
  options: SelectOption[];
  size?: "sm" | "md" | "lg";
  error?: string;
  disabled?: boolean;
  onChange?: (id: string | number, option: SelectOption) => void;
  style?: CSSProperties;
}

export function Select(props: SelectProps): JSX.Element;
