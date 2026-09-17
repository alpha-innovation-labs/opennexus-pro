import { readFileSync } from "node:fs";
import type { CustomEntry, FileEntry } from "@earendil-works/pi-coding-agent";
import { parseSessionEntries } from "@earendil-works/pi-coding-agent";
import type { SubagentLaunchConfig, SubagentLaunchMetadata } from "./types";

/**
 * The `customType` that marks the launch-metadata entry inside a run's session
 * file.
 *
 * A plain custom entry does not participate in LLM context, so persisting the
 * launch config here is invisible to the child's model while staying on disk,
 * inspectable with a text tool, and re-readable on resume.
 */
export const SUBAGENT_LAUNCH_CUSTOM_TYPE = "subagent.launch" as const;

/**
 * Build the custom entry that persists the launch config.
 *
 * The caller supplies the entry id, parent id, and timestamp so the entry fits
 * the seeded file's tree (it becomes a child of the current leaf, or the root
 * entry when the file carries no conversation).
 */
export function createLaunchMetadataEntry(input: {
	readonly id: string;
	readonly parentId: string | null;
	readonly timestamp: string;
	readonly sessionId?: string;
	readonly config: SubagentLaunchConfig;
}): CustomEntry<SubagentLaunchMetadata> {
	return {
		type: "custom",
		customType: SUBAGENT_LAUNCH_CUSTOM_TYPE,
		data: {
			version: 1,
			...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
			config: input.config,
		},
		id: input.id,
		parentId: input.parentId,
		timestamp: input.timestamp,
	};
}

/**
 * Read the launch config back out of a seeded session file.
 *
 * This is the "file is the record" half of the split: the durable record, not
 * memory, is what resume reads to reconstruct the original invocation. Returns
 * `null` when the file is missing, unreadable, or carries no launch-metadata
 * entry.
 */
export function readSubagentLaunchConfig(
	filePath: string,
): SubagentLaunchConfig | null {
	let fileEntries: FileEntry[];
	try {
		fileEntries = parseSessionEntries(readFileSync(filePath, "utf8"));
	} catch {
		return null;
	}

	for (const entry of fileEntries) {
		if (entry.type !== "custom") continue;
		if (entry.customType !== SUBAGENT_LAUNCH_CUSTOM_TYPE) continue;
		const data = entry.data;
		if (
			typeof data === "object" &&
			data !== null &&
			(data as SubagentLaunchMetadata).version === 1 &&
			typeof (data as SubagentLaunchMetadata).config === "object" &&
			(data as SubagentLaunchMetadata).config !== null
		) {
			return (data as SubagentLaunchMetadata).config;
		}
	}

	return null;
}
