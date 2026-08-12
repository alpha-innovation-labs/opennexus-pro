import {
	createPiToolDefinitions,
	type PiToolDefinition,
} from "@nexus/pi-platform";
import { estimateTokensFromText } from "../estimateTokensFromText";
import { getToolText } from "../getToolText";
import type { ContextUsageDetailItem } from "../types";

/**
 * Creates tokenized items for Pi's built-in tool prompt snippets.
 *
 * @param cwd Current working directory passed to Pi tool definitions.
 * @returns Pi built-in tool detail items.
 */
export async function createPiBuiltinToolItems(
	cwd: string,
): Promise<ContextUsageDetailItem[]> {
	return Object.entries(createPiToolDefinitions(cwd))
		.filter(
			(entry): entry is [string, PiToolDefinition] => {
				const def = entry[1] as PiToolDefinition;
				return typeof def.promptSnippet === "string" && def.promptSnippet.length > 0;
			},
		)
		.map(([name, definition]) => ({
			label: name,
			tokens: estimateTokensFromText(
				getToolText(name, definition.promptSnippet ?? ""),
			),
		}));
}
