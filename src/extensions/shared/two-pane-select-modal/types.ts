import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";

/**
 * Theme contract used by the modal components.
 */
export type UITheme = ExtensionContext["ui"]["theme"];

/**
 * Style hooks for list item rendering.
 */
export type ItemStyleFns = {
	label?: (item: AutocompleteItem, selected: boolean, text: string, theme: UITheme) => string;
	description?: (item: AutocompleteItem, selected: boolean, text: string, theme: UITheme) => string;
};

/**
 * Options accepted by the two-pane modal.
 */
export type TwoPaneSelectModalOptions = {
	leftTitle?: string;
	rightTitle?: string;
	bottomTitle?: string;
	bottomPrefix?: string;
	showLeftPane?: boolean;
	showRightPane?: boolean;
	leftPaneRatio?: number;
	leftPaneMaxWidth?: number;
	itemStyles?: ItemStyleFns;
	itemMaxLines?: (item: AutocompleteItem) => number;
};
