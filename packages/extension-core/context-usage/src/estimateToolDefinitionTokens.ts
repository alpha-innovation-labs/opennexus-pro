import { estimateTokensFromText } from "./estimateTokensFromText";
import type { ToolDefinitionInfo } from "./types";

/**
 * Estimates the token cost of a single tool definition as sent to the API.
 * The API receives the full JSON: { name, description, parameters }.
 *
 * @param def Full tool definition.
 * @returns Estimated token count for this tool's API representation.
 */
export function estimateToolDefinitionTokens(def: ToolDefinitionInfo): number {
	const wire = JSON.stringify({
		name: def.name,
		description: def.description,
		parameters: def.parameters,
	});
	return estimateTokensFromText(wire);
}

/**
 * Sums estimated tokens across all tool definitions.
 *
 * @param defs Full tool definitions.
 * @returns Total estimated tokens for the tools array.
 */
export function estimateToolDefinitionsTokens(
	defs: readonly ToolDefinitionInfo[],
): number {
	return defs.reduce((total, def) => total + estimateToolDefinitionTokens(def), 0);
}
