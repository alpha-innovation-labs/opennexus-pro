import { readPromptlineConfig } from "./readPromptlineConfig";
import { setPromptlineConfig } from "./state";
import type { PromptlineConfig } from "./types";

/**
 * Reloads promptline config from disk and caches it for the session.
 *
 * @param cwd Project working directory.
 * @returns Fresh promptline config.
 */
export async function refreshPromptlineConfig(
	cwd: string,
): Promise<PromptlineConfig> {
	const config = await readPromptlineConfig(cwd);
	setPromptlineConfig(config);
	return config;
}
