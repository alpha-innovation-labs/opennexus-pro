import { bridgedToolCallIds } from "./state.ts";

/**
 * Returns whether the tool call should visually attach to prior thinking.
 *
 * @param toolCallId Tool call id to inspect.
 * @returns Whether the top border should be omitted.
 */
export function shouldBridgeThinkingToTool(toolCallId: string): boolean {
	return bridgedToolCallIds.has(toolCallId);
}
