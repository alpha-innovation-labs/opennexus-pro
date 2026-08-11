import { pad2 } from "./pad2";

/**
 * Formats a timestamp for rendered observations.
 *
 * @param timestamp Epoch milliseconds.
 * @returns Human-readable timestamp.
 */
export function formatObservationTimestamp(timestamp: number): string {
	const date = new Date(timestamp);
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}
