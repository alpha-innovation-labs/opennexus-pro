import { extractJsonArrayText } from "./extractJsonArrayText";
import type { RecreatedObservationTopic } from "./types/RecreatedObservationTopic";

/**
 * Parses LLM observation-recreation output into validated topics.
 *
 * @param output Raw model output.
 * @returns Valid recreated topics.
 */
export function parseRecreatedObservationTopics(
	output: string,
): RecreatedObservationTopic[] {
	const jsonText = extractJsonArrayText(output);
	if (!jsonText) return [];
	try {
		const parsed = JSON.parse(jsonText) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.flatMap((item) => parseTopic(item));
	} catch {
		return [];
	}
}

/**
 * Parses one candidate topic object.
 *
 * @param item Candidate topic.
 * @returns One topic or an empty array.
 */
function parseTopic(item: unknown): RecreatedObservationTopic[] {
	if (!item || typeof item !== "object") return [];
	const candidate = item as {
		title?: unknown;
		sourceMessageIndexes?: unknown;
		userMessages?: unknown;
		assistantBullets?: unknown;
	};
	if (
		typeof candidate.title !== "string" ||
		!Array.isArray(candidate.sourceMessageIndexes)
	)
		return [];
	const sourceMessageIndexes = candidate.sourceMessageIndexes.filter(
		(index): index is number => Number.isInteger(index) && index > 0,
	);
	const userMessages = parseStringArray(candidate.userMessages);
	const assistantBullets = parseStringArray(candidate.assistantBullets);
	if (candidate.title.trim().length === 0 || sourceMessageIndexes.length === 0)
		return [];
	return [
		{
			title: candidate.title.trim(),
			sourceMessageIndexes,
			userMessages,
			assistantBullets,
		},
	];
}

/**
 * Parses a candidate string array.
 *
 * @param value Candidate value.
 * @returns String items.
 */
function parseStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter((item): item is string => typeof item === "string")
		.map((item) => item.trim())
		.filter(Boolean);
}
