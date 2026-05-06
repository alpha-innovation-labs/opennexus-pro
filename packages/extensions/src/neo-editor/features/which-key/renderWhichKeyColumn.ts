import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import { renderWhichKeyPanel } from "./renderWhichKeyPanel.js";
import type { WhichKeyGroup } from "./types.js";

/**
 * Renders one column of which-key groups.
 *
 * @param uiTheme Active UI theme.
 * @param groups Groups assigned to the column.
 * @param width Column width.
 * @returns Rendered column lines.
 */
export function renderWhichKeyColumn(uiTheme: SelectPreviewTheme, groups: WhichKeyGroup[], width: number): string[] {
  return groups.flatMap((group, index) => [
    ...(index === 0 ? [] : [""]),
    ...renderWhichKeyPanel(uiTheme, group, width),
  ]);
}
