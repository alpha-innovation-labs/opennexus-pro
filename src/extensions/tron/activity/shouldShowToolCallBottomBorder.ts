import { toolCallBottomBorderIds } from "./state.ts";

/**
 * Returns whether a compact tool-call row should render its bottom border.
 *
 * @param toolCallId Tool call id.
 * @returns True when the tool call is currently the final visible assistant activity.
 */
export function shouldShowToolCallBottomBorder(toolCallId: string): boolean {
  return toolCallBottomBorderIds.has(toolCallId);
}
