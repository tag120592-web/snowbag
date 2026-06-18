import { CSSProperties, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  resize?: "none" | "vertical" | "horizontal" | "both";
  disabled?: boolean;
  style?: CSSProperties;
}

export function Textarea(props: TextareaProps): JSX.Element;
