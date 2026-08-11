import { formatTwoDigitTimePart } from "./formatTwoDigitTimePart";

/**
 * Formats elapsed working time for the TUI loader.
 *
 * @param elapsedMs Elapsed milliseconds.
 * @returns Compact elapsed time.
 */
export function formatWorkingElapsed(elapsedMs: number): string {
	const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
	const seconds = totalSeconds % 60;
	const totalMinutes = Math.floor(totalSeconds / 60);
	const minutes = totalMinutes % 60;
	const hours = Math.floor(totalMinutes / 60);

	if (hours > 0) {
		return `${hours}:${formatTwoDigitTimePart(minutes)}:${formatTwoDigitTimePart(seconds)}`;
	}

	return `${minutes}:${formatTwoDigitTimePart(seconds)}`;
}
