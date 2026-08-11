import type { SharedModalHotkey } from "./hotkeys/types";

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
	contentType?: "plain" | "markdown";
	minWidth?: number;
};

/**
 * Shared modal component options.
 */
export type SharedModalOptions = {
	/** Modal-specific hotkeys shown on the left side of the shared footer. */
	footerHotkeys?: SharedModalHotkey[];
	footerLines?: string[];
	fullScreen?: boolean;
	fullScreenHotkey?: string | false;
	fullScreenRows?: number | (() => number);
	hidePaneTopBorder?: boolean;
	headerLines?: string[];
	maxWidth?: number;
	maxWidthRatio?: number;
	minWidth?: number;
	onClose?: () => void;
	onFullScreenChange?: (enabled: boolean) => void;
	overflowScrollbar?: boolean;
	panes: SharedModalPane[];
	theme: SharedModalTheme;
};
