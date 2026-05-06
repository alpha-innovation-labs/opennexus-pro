import { formatPromptlineSessionRunTime } from "./formatPromptlineSessionRunTime.js";
import { getPromptlineSessionStartedAt } from "./getPromptlineSessionStartedAt.js";

/**
 * Builds the displayed promptline session runtime label.
 *
 * @returns Runtime label wrapped in a stopwatch badge.
 */
export function getPromptlineSessionRunTimeLabel(): string {
	return `[⏱ ${formatPromptlineSessionRunTime(Date.now() - getPromptlineSessionStartedAt())}]`;
}
