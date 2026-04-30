/**
 * Theme contract used by shared modal components.
 */
export type SharedModalTheme = {
  fg(color: string, value: string): string;
};

/**
 * One pane rendered inside the shared modal frame.
 */
export type SharedModalPane = {
  id: string;
  size: number;
  lines: string[];
  minWidth?: number;
};

/**
 * Shared modal component options.
 */
export type SharedModalOptions = {
  footerLines?: string[];
  fullScreen?: boolean;
  headerLines?: string[];
  maxWidth?: number;
  maxWidthRatio?: number;
  minWidth?: number;
  onClose?: () => void;
  panes: SharedModalPane[];
  theme: SharedModalTheme;
};
