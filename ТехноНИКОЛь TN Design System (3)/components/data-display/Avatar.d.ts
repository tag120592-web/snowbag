import { CSSProperties } from "react";

export interface AvatarProps {
  /** Initials shown when no image. */
  text?: string;
  /** Image URL. */
  image?: string;
  /** Lucide icon name (fallback content). */
  icon?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Rounded-square instead of circle. */
  square?: boolean;
  /** Presence dot. */
  status?: "green" | "yellow" | "red" | "gray";
  /** Background color for initials. */
  color?: string;
  style?: CSSProperties;
}

export function Avatar(props: AvatarProps): JSX.Element;
