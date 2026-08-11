import type { BuildSystemPromptOptions } from "@earendil-works/pi-coding-agent";

let latestSystemPromptOptions: BuildSystemPromptOptions | undefined;

/**
 * Stores the latest live system prompt options observed before an agent turn.
 *
 * @param options Live system prompt options.
 */
export function setLatestSystemPromptOptions(
	options: BuildSystemPromptOptions,
): void {
	latestSystemPromptOptions = options;
}

/**
 * Gets the latest live system prompt options observed in this extension instance.
 *
 * @returns Last observed system prompt options.
 */
export function getLatestSystemPromptOptions():
	| BuildSystemPromptOptions
	| undefined {
	return latestSystemPromptOptions;
}
