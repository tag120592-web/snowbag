import { ReactNode, CSSProperties, HTMLAttributes } from "react";

/**
 * TN surface container.
 *
 * @startingPoint section="Data display" subtitle="Card surface" viewport="700x200"
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  padding?: "none" | "sm" | "md" | "lg" | number;
  elevation?: "none" | "small" | "large";
  bordered?: boolean;
  radius?: string;
  /** Lift on hover. */
  hoverable?: boolean;
  style?: CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
