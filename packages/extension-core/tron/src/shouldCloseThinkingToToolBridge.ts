import { bridgedToolCallClosingIds } from "./activity/state";

/**
 * Returns whether one tool call should close a prior thinking-to-tool shared box.
 *
 * @param toolCallId Tool call id to inspect.
 * @returns Whether this tool call should render the closing border.
 */
export function shouldCloseThinkingToToolBridge(toolCallId: string): boolean {
	return bridgedToolCallClosingIds.has(toolCallId);
}
