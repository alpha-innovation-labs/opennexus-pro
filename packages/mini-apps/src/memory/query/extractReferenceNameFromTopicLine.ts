const TOPIC_REFERENCE_PREFIX = /^-\s+([^:]+):/;

/**
 * Extracts the linked reference file name from a topic bullet line.
 *
 * @param line Topic bullet line.
 * @returns Reference file name when present.
 */
export function extractReferenceNameFromTopicLine(line: string): string | undefined {
	return TOPIC_REFERENCE_PREFIX.exec(line)?.[1]?.trim();
}
