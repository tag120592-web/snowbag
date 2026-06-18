import { CSSProperties } from "react";

export type TabOption = {
  id: string | number;
  name: string;
  /** Secondary count/label, e.g. a number. */
  secondaryText?: string | number;
  /** Lucide icon name. */
  icon?: string;
  disabled?: boolean;
};

/**
 * TN tab strip.
 *
 * @startingPoint section="Navigation" subtitle="Tabs — underline & segmented" viewport="700x120"
 */
export interface TabsProps {
  options: TabOption[];
  value?: string | number;
  variant?: "underline" | "segmented";
  size?: "sm" | "md";
  onChange?: (id: string | number) => void;
  style?: CSSProperties;
}

export function Tabs(props: TabsProps): JSX.Element;
