import { formatPromptlineSessionRunTime } from "./formatPromptlineSessionRunTime";
import { getPromptlineSessionStartedAt } from "./getPromptlineSessionStartedAt";

/**
 * Builds the displayed promptline session runtime label.
 *
 * @returns Runtime label as elapsed time.
 */
export function getPromptlineSessionRunTimeLabel(): string {
	const elapsed = Date.now() - getPromptlineSessionStartedAt();
	return `\u23f1 ${formatPromptlineSessionRunTime(elapsed)}`;
}
