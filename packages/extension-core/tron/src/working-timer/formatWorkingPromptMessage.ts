import { formatCompactDuration } from "../duration/formatCompactDuration.js";

/**
 * Formats the active prompt working message with an elapsed timer.
 *
 * @param startedAt Prompt start timestamp in milliseconds.
 * @param now Current timestamp in milliseconds.
 * @returns Working message with compact elapsed duration.
 */
export function formatWorkingPromptMessage(startedAt: number, now: number): string {
	return `Working... (⏱ ${formatCompactDuration(Math.max(0, now - startedAt))})`;
}
