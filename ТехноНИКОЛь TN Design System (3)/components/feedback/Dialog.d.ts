import { ReactNode, CSSProperties } from "react";

/**
 * TN modal dialog.
 *
 * @startingPoint section="Feedback" subtitle="Modal dialog" viewport="700x460"
 */
export interface DialogProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  /** Footer node, usually a row of Buttons. */
  footer?: ReactNode;
  width?: number;
  onClose?: () => void;
  style?: CSSProperties;
}

export function Dialog(props: DialogProps): JSX.Element | null;
