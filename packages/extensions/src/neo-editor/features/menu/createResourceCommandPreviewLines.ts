import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import { addLineNumbers } from "./addLineNumbers.js";
import { createResourceCommandMarkdown } from "./createResourceCommandMarkdown.js";
import { renderResourceCommandMarkdown } from "./renderResourceCommandMarkdown.js";
import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";

const RESOURCE_COMMAND_PREVIEW_WIDTH = 58;

/**
 * Creates rendered markdown preview lines for a resource command.
 *
 * @param item Resource command item.
 * @param theme Active UI theme.
 * @returns Rendered markdown preview lines.
 */
export function createResourceCommandPreviewLines(item: SlashMenuLeaf | SlashMenuSection, theme: SharedModalTheme): string[] {
  return addLineNumbers(renderResourceCommandMarkdown(createResourceCommandMarkdown(item), RESOURCE_COMMAND_PREVIEW_WIDTH), theme);
}
