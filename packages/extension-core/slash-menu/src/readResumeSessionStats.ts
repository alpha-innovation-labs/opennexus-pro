import { existsSync, readFileSync } from "node:fs";
import {
	buildSessionContext,
	parseSessionEntries,
} from "@earendil-works/pi-coding-agent";

// loadEntriesFromFile is not exported from the package — re-implemented here.
function loadEntriesFromFileStub(
	filePath: string,
): ReturnType<typeof parseSessionEntries> {
	const resolved = filePath;
	if (!existsSync(resolved)) return [];
	const content = readFileSync(resolved, "utf8");
	const entries = parseSessionEntries(content);
	// Validate session header
	if (entries.length === 0) return entries;
	const header = entries[0];
	if (
		header.type !== "session" ||
		typeof (header as unknown as Record<string, unknown>).id !== "string"
	) {
		return [];
	}
	return entries;
}

export interface ResumeSessionStats {
	humanMessages: number;
	toolCalls: number;
	thinkingBlocks: number;
}

/**
 * Reads one persisted session file and counts the visible conversation summary stats.
 *
 * @param sessionPath Absolute persisted session path.
 * @returns Human, tool, and thinking counts for the active session branch.
 */
export function readResumeSessionStats(
	sessionPath: string,
): ResumeSessionStats {
	// loadEntriesFromFile is not exported from the package — re-implemented here.
	const entries = loadEntriesFromFileStub(sessionPath);
	const sessionContext = buildSessionContext(entries as never);

	return (sessionContext.messages as { role?: string; content?: unknown[] }[]).reduce<ResumeSessionStats>(
		(stats: ResumeSessionStats, message) => {
			if (message.role === "user") {
				stats.humanMessages += 1;
				return stats;
			}
			if (message.role !== "assistant" || !Array.isArray(message.content)) {
				return stats;
			}
			for (const block of message.content) {
				if (!block || typeof block !== "object" || !("type" in block)) continue;
				if ((block as { type?: string }).type === "toolCall") stats.toolCalls += 1;
				if (
					(block as { type?: string }).type === "thinking" &&
					typeof (block as { thinking?: string }).thinking === "string" &&
					(block as { thinking?: string }).thinking!.trim()
				) {
					stats.thinkingBlocks += 1;
				}
			}
			return stats;
		},
		{ humanMessages: 0, toolCalls: 0, thinkingBlocks: 0 },
	);
}
