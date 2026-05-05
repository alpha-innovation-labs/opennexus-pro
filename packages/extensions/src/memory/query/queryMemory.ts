import { join } from "node:path";
import { extractReferenceNameFromTopicLine } from "./extractReferenceNameFromTopicLine.js";
import { isTopicMemoryItem } from "./isTopicMemoryItem.js";
import { matchesMemoryQuery } from "./matchesMemoryQuery.js";
import { listMemoryItems } from "../storage/listMemoryItems.js";
import type { MemoryQueryResult } from "../types/MemoryQueryResult.js";

/**
 * Queries topic memory entries without reading raw references into context.
 *
 * @param root Memory root directory.
 * @param query Case-insensitive query string.
 * @param limit Maximum result count.
 * @returns Matching topic entries.
 */
export async function queryMemory(root: string, query: string, limit: number): Promise<MemoryQueryResult[]> {
	const items = await listMemoryItems(root);
	const results: MemoryQueryResult[] = [];
	for (const item of items.filter(isTopicMemoryItem)) {
		const [project = "", topicFile = ""] = item.relativePath.split("/");
		const topic = topicFile.replace(/\.md$/, "");
		for (const line of item.content.split(/\r?\n/).filter((entry) => entry.startsWith("- "))) {
			if (!matchesMemoryQuery(`${project} ${topic} ${line}`, query)) continue;
			const referenceName = extractReferenceNameFromTopicLine(line);
			results.push({ project, topic, line, referenceName, referencePath: referenceName ? join(root, project, "references", referenceName) : undefined });
			if (results.length >= limit) return results;
		}
	}
	return results;
}
