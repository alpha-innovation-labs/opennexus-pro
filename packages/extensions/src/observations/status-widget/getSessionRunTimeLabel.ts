import { formatSessionRunTime } from "./formatSessionRunTime.js";
import { getSessionStartedAt } from "./getSessionStartedAt.js";

/**
 * Builds the displayed session runtime label.
 *
 * @returns Runtime label wrapped in parentheses.
 */
export function getSessionRunTimeLabel(): string {
	return `(${formatSessionRunTime(Date.now() - getSessionStartedAt())})`;
}
