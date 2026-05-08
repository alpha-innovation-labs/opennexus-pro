import { BULLET_MARKERS, CHECKBOX_CHECKED, CHECKBOX_TODO, CHECKBOX_UNCHECKED } from "../constants.js";
import { styleMarkdownPreviewSegment } from "../styleMarkdownPreviewSegment.js";
import type { MarkdownPreviewTheme } from "../types.js";
import { renderParagraph } from "./renderParagraph.js";

/** Renders a Ratkit-style ordered, unordered, or task-list item. */
export function renderListItem(depth: number, orderedNumber: number | undefined, content: string, theme?: MarkdownPreviewTheme): string {
  const indent = "  ".repeat(Math.max(0, depth));
  const marker = orderedNumber === undefined ? BULLET_MARKERS[depth % BULLET_MARKERS.length] : `${orderedNumber}. `;
  const task = extractTaskPrefix(content);
  const body = task === undefined ? content : task.content;
  const checkbox = task === undefined ? "" : renderCheckbox(task.state, theme);
  const styledMarker = styleMarkdownPreviewSegment(theme, "list.marker", marker);
  return ` ${indent}${styledMarker}${checkbox}${renderParagraph(body, theme)}`;
}

/** Extracts a GitHub-style task-list marker from list item content. */
function extractTaskPrefix(content: string): { state: "checked" | "todo" | "unchecked"; content: string } | undefined {
  const match = /^\[([ xX-])\]\s+(.*)$/u.exec(content);
  if (match === null) return undefined;
  const state = match[1] === "x" || match[1] === "X" ? "checked" : match[1] === "-" ? "todo" : "unchecked";
  return { state, content: match[2] ?? "" };
}

/** Renders a task-list checkbox marker. */
function renderCheckbox(state: "checked" | "todo" | "unchecked", theme?: MarkdownPreviewTheme): string {
  if (state === "checked") return styleMarkdownPreviewSegment(theme, "checkbox.checked", CHECKBOX_CHECKED);
  if (state === "todo") return styleMarkdownPreviewSegment(theme, "checkbox.todo", CHECKBOX_TODO);
  return styleMarkdownPreviewSegment(theme, "checkbox.unchecked", CHECKBOX_UNCHECKED);
}
