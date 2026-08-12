import type { ToolRegistrationRecord } from "@nexus/feature-flags";
import { formatExtensionIdLabel } from "./formatExtensionIdLabel";
import type { SlashMenuLeaf } from "./types";

/**
 * Builds slash-menu leaves from recorded extension tool registrations.
 *
 * @param records Recorded extension tool registrations.
 * @returns Tool leaves grouped by registering extension id.
 */
export function createRecordedToolLeaves(
	records: ToolRegistrationRecord[],
): SlashMenuLeaf[] {
	return records.map((record) => ({
		kind: "entry" as const,
		label: record.name,
		description: normalizeDescription(record.description),
		groupLabel: formatExtensionIdLabel(record.extensionId),
		sourcePath: `extension:${record.extensionId}`,
		sourceScope: "project" as const,
		value: record.name,
	}));
}

/**
 * Normalizes one recorded tool description.
 *
 * @param description Raw description.
 * @returns Single-line description text.
 */
function normalizeDescription(description: string): string {
	const normalized = description.trim().replace(/\s+/gu, " ");
	return normalized.length > 0 ? normalized : "No description";
}
