import type { Details } from "../../vendor/types.js";
import type { SubagentToolResult } from "../types.js";

/**
 * Creates a result payload flagged as an error for the subagents UI.
 *
 * @param text Error message text.
 * @returns Error-shaped subagent tool result.
 */
export function createErrorResult(text: string): SubagentToolResult {
	return {
		content: [{ type: "text", text }],
		isError: true,
		details: { mode: "single", results: [] } satisfies Details,
	};
}
