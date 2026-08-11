import { toolCallTopBorderIds } from "./state";

/**
 * Returns whether a compact tool-call row should render its top border.
 *
 * @param toolCallId Tool call id.
 * @returns True when the tool call starts the visible assistant activity block.
 */
export function shouldShowToolCallTopBorder(toolCallId: string): boolean {
	return toolCallTopBorderIds.has(toolCallId);
}
