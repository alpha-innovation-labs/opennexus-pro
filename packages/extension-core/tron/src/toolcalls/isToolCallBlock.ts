import type { ToolCallBlock } from "./types";

/**
 * Returns whether a value is a tool call content block.
 *
 * @param value Unknown content block.
 * @returns True when the block is a tool call.
 */
export function isToolCallBlock(value: unknown): value is ToolCallBlock {
	return !!value && typeof value === "object" && (value as { type?: unknown }).type === "toolCall";
}
