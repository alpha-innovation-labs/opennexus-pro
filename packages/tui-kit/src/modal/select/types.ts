import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { AutocompleteItem } from "@earendil-works/pi-tui";

/** Theme contract used by selectable shared modal components. */
export type SelectPreviewTheme = ExtensionContext["ui"]["theme"];

/** Style hooks for list item rendering. */
export type SelectPreviewItemStyleFns = {
  label?: (item: AutocompleteItem, selected: boolean, text: string, theme: SelectPreviewTheme) => string;
  description?: (item: AutocompleteItem, selected: boolean, text: string, theme: SelectPreviewTheme) => string;
};

/** Options accepted by the shared select preview modal. */
export type SelectPreviewModalOptions = {
  bottomPrefix?: string;
  bottomTitle?: string;
  fullScreen?: boolean;
  itemMaxLines?: (item: AutocompleteItem) => number;
  itemStyles?: SelectPreviewItemStyleFns;
  leftPaneMaxWidth?: number;
  leftPaneRatio?: number;
  maxWidth?: number;
  maxWidthRatio?: number;
  minWidth?: number;
  leftTitle?: string;
  rightTitle?: string;
  showLeftPane?: boolean;
  showRightPane?: boolean;
};
