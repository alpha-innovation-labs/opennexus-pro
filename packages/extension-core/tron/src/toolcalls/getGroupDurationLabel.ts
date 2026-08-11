import { formatCompactDuration } from "../duration/formatCompactDuration";

/**
 * Builds the duration label for one user-prompt group.
 *
 * @param startedAt User prompt start timestamp.
 * @param finishedAt Last assistant timestamp.
 * @returns Compact duration label wrapped in parentheses.
 */
export function getGroupDurationLabel(
	startedAt?: number,
	finishedAt?: number,
): string | undefined {
	if (
		typeof startedAt !== "number" ||
		typeof finishedAt !== "number" ||
		finishedAt < startedAt
	)
		return undefined;
	return `(${formatCompactDuration(finishedAt - startedAt)})`;
}
