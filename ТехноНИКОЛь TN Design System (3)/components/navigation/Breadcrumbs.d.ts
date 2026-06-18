import { CSSProperties } from "react";

export type BreadcrumbItem = { text: string; to?: string; href?: string };

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
  style?: CSSProperties;
}

export function Breadcrumbs(props: BreadcrumbsProps): JSX.Element;
