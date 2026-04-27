import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { SelectPreviewItemStyleFns, SelectPreviewTheme } from "./types.js";
import { wrapTextLines } from "./wrapTextLines.js";

export type RenderSelectListLinesOptions = {
  itemMaxLines?: (item: AutocompleteItem) => number;
  items: AutocompleteItem[];
  maxVisible: number;
  selectedIndex: number;
  styles?: SelectPreviewItemStyleFns;
  theme: SelectPreviewTheme;
  width: number;
};

type SelectListRenderRow = {
  itemIndex?: number;
  text: string;
};

/**
 * Renders the visible rows for a selectable list.
 *
 * @param options Render options.
 * @returns Rendered list rows.
 */
export function renderSelectListLines(options: RenderSelectListLinesOptions): string[] {
  if (options.items.length === 0) return [options.theme.fg("warning", "No matching commands")];
  const rows = createSelectListRenderRows(options);
  const selectedRowIndex = getSelectedRowIndex(rows, options.selectedIndex);
  const startIndex = getRowWindowStart(selectedRowIndex, options.maxVisible, rows.length);
  const endIndex = Math.min(startIndex + options.maxVisible, rows.length);
  const lines = rows.slice(startIndex, endIndex).map((row) => row.text);
  if ((startIndex > 0 || endIndex < rows.length) && lines.length < options.maxVisible) {
    lines.push(options.theme.fg("dim", truncateToWidth(`(${Math.max(options.selectedIndex + 1, 0)}/${options.items.length})`, options.width, "")));
  }
  return lines;
}

/**
 * Creates render rows including group headings and wrapped item rows.
 *
 * @param options Render options.
 * @returns Flat render rows with source item indexes.
 */
function createSelectListRenderRows(options: RenderSelectListLinesOptions): SelectListRenderRow[] {
  const rows: SelectListRenderRow[] = [];
  let previousGroupLabel: string | undefined;
  for (let index = 0; index < options.items.length; index += 1) {
    const item = options.items[index]!;
    const groupLabel = getGroupLabel(item);
    if (groupLabel && groupLabel !== previousGroupLabel) rows.push({ text: renderGroupHeader(options, groupLabel) });
    previousGroupLabel = groupLabel;
    rows.push(...renderSelectListItem(options, item, index === options.selectedIndex).map((text) => ({ itemIndex: index, text })));
  }
  return rows;
}

/**
 * Finds the row index for the selected item.
 *
 * @param rows Render rows.
 * @param selectedIndex Selected item index.
 * @returns Selected row index.
 */
function getSelectedRowIndex(rows: SelectListRenderRow[], selectedIndex: number): number {
  const rowIndex = rows.findIndex((row) => row.itemIndex === selectedIndex);
  return rowIndex >= 0 ? rowIndex : 0;
}

/**
 * Calculates the first visible row index around the selected row.
 *
 * @param selectedRowIndex Selected render-row index.
 * @param maxVisible Maximum visible rows.
 * @param rowCount Number of render rows.
 * @returns First visible row index.
 */
function getRowWindowStart(selectedRowIndex: number, maxVisible: number, rowCount: number): number {
  return Math.max(0, Math.min(selectedRowIndex - Math.floor(maxVisible / 2), rowCount - maxVisible));
}

/**
 * Renders one item into one or more rows.
 *
 * @param options Render options.
 * @param item Item to render.
 * @param selected Whether the item is selected.
 * @returns Rendered item rows.
 */
function renderSelectListItem(options: RenderSelectListLinesOptions, item: AutocompleteItem, selected: boolean): string[] {
  const rawLabel = item.label || item.value;
  const description = item.description?.replace(/[\r\n]+/g, " ").trim();
  const maxLines = Math.max(1, options.itemMaxLines?.(item) ?? 1);
  if ((item as { preserveLabelWhitespace?: boolean }).preserveLabelWhitespace) return renderWhitespaceLabel(options, item, selected, rawLabel);
  if (description) return renderDescribedItem(options, item, selected, rawLabel, description, maxLines);
  const indent = getItemIndent(item);
  return wrapTextLines(rawLabel, Math.max(1, options.width - 3 - visibleWidth(indent)), maxLines).map((line) => ` ${indent}${styleLabel(options, item, selected, line)}`);
}

/**
 * Renders an item whose label spacing must be preserved.
 *
 * @param options Render options.
 * @param item Item to render.
 * @param selected Whether the item is selected.
 * @param rawLabel Raw label text.
 * @returns Rendered item rows.
 */
function renderWhitespaceLabel(options: RenderSelectListLinesOptions, item: AutocompleteItem, selected: boolean, rawLabel: string): string[] {
  const indent = getItemIndent(item);
  const lineWidth = Math.max(1, options.width - 3 - visibleWidth(indent));
  return rawLabel.split("\n").map((line) => {
    const labelLine = truncateToWidth(line, lineWidth, "");
    return ` ${indent}${styleLabel(options, item, selected, labelLine)}`;
  });
}

/**
 * Renders an item with a right-aligned description.
 *
 * @param options Render options.
 * @param item Item to render.
 * @param selected Whether the item is selected.
 * @param rawLabel Raw label.
 * @param description Raw description.
 * @param maxLines Maximum label lines.
 * @returns Rendered item rows.
 */
function renderDescribedItem(options: RenderSelectListLinesOptions, item: AutocompleteItem, selected: boolean, rawLabel: string, description: string, maxLines: number): string[] {
  const indent = getItemIndent(item);
  const maxDescriptionWidth = Math.max(4, Math.min(18, Math.floor(options.width * 0.4)));
  const descText = truncateToWidth(description, maxDescriptionWidth, "");
  const labelLines = wrapTextLines(rawLabel, Math.max(1, options.width - 1 - visibleWidth(indent) - visibleWidth(descText) - 1), maxLines);
  const firstLabel = labelLines.shift() || "";
  const spacing = " ".repeat(Math.max(1, options.width - 1 - visibleWidth(indent) - visibleWidth(firstLabel) - visibleWidth(descText)));
  return [` ${indent}${styleLabel(options, item, selected, firstLabel)}${spacing}${styleDescription(options, item, selected, descText)}`, ...labelLines.map((line) => ` ${indent}${styleLabel(options, item, selected, line)}`)];
}

/**
 * Renders a non-selectable group heading for grouped list items.
 *
 * @param options Render options.
 * @param groupLabel Group heading text.
 * @returns Rendered group heading.
 */
function renderGroupHeader(options: RenderSelectListLinesOptions, groupLabel: string): string {
  return ` ${options.theme.fg("accent", options.theme.bold(truncateToWidth(groupLabel, Math.max(1, options.width - 2), "")))}`;
}

/**
 * Reads an optional group label from an autocomplete item.
 *
 * @param item Item to inspect.
 * @returns Group label when present.
 */
function getGroupLabel(item: AutocompleteItem): string | undefined {
  const groupLabel = (item as { groupLabel?: string }).groupLabel?.trim();
  return groupLabel || undefined;
}

/**
 * Returns the indent used for selectable rows under a group heading.
 *
 * @param item Item to inspect.
 * @returns Row indentation.
 */
function getItemIndent(item: AutocompleteItem): string {
  return getGroupLabel(item) ? "  " : "";
}

/** Styles a label segment. */
function styleLabel(options: RenderSelectListLinesOptions, item: AutocompleteItem, selected: boolean, text: string): string {
  if (options.styles?.label) return options.styles.label(item, selected, text, options.theme);
  return selected ? options.theme.fg("accent", options.theme.bold(text)) : text;
}

/** Styles a description segment. */
function styleDescription(options: RenderSelectListLinesOptions, item: AutocompleteItem, selected: boolean, text: string): string {
  return options.styles?.description ? options.styles.description(item, selected, text, options.theme) : options.theme.fg("muted", text);
}
