import { CSSProperties, InputHTMLAttributes } from "react";

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  onClear?: () => void;
  style?: CSSProperties;
}

export function Search(props: SearchProps): JSX.Element;
