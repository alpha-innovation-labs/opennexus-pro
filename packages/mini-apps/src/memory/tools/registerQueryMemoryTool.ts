import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { queryMemory } from "../query/queryMemory.js";
import { resolveMemoryRoot } from "../settings/resolveMemoryRoot.js";

/**
 * Registers a topic-first memory query tool.
 *
 * @param pi Extension API.
 */
export function registerQueryMemoryTool(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "memory_query",
		label: "Query Memory",
		description: "Search Nexus memory topic entries and return matching one-line memories with linked reference names.",
		promptSnippet: "Use memory_query to search Nexus memory before reading raw memory files directly",
		parameters: Type.Object({
			query: Type.String({ description: "Case-insensitive search text." }),
			limit: Type.Optional(Type.Number({ description: "Maximum matches to return. Defaults to 10." })),
		}),
		async execute(_toolCallId, params) {
			const results = await queryMemory(await resolveMemoryRoot(), params.query, params.limit ?? 10);
			const text = results.length === 0 ? "No memory matches." : results.map((result) => `- ${result.project}/${result.topic}: ${result.line}${result.referenceName ? ` [ref: ${result.referenceName}]` : ""}`).join("\n");
			return { content: [{ type: "text", text }], details: { results } };
		},
	});
}
