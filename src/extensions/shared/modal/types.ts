import type { ExtensionContext } from "@mariozechner/pi-coding-agent";

/**
 * Theme contract used by shared modal components.
 */
export type SharedModalTheme = ExtensionContext["ui"]["theme"];

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
  headerLines?: string[];
  maxWidthRatio?: number;
  minWidth?: number;
  onClose?: () => void;
  panes: SharedModalPane[];
  theme: SharedModalTheme;
};
