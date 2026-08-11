import { normalizeObservationSummaryText } from "./normalizeObservationSummaryText";

export const OBSERVATION_SUMMARY_MAX_CHARS = 360;

/**
 * Truncates an observation summary to the modal character budget.
 *
 * @param value Summary text to cap.
 * @returns Summary no longer than the configured maximum.
 */
export function truncateObservationSummary(value: string): string {
	const normalized = normalizeObservationSummaryText(value);
	if (normalized.length <= OBSERVATION_SUMMARY_MAX_CHARS) return normalized;
	return `${normalized.slice(0, OBSERVATION_SUMMARY_MAX_CHARS - 1).trimEnd()}…`;
}
