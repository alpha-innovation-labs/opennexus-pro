import { countActiveSkillsInSystemPrompt } from "./countActiveSkillsInSystemPrompt";
import { isAgentsMdLoadedInSystemPrompt } from "./isAgentsMdLoadedInSystemPrompt";
import type { StartupHeroStatus } from "./types";

/**
 * Builds startup hero status values from the effective system prompt.
 *
 * @param systemPrompt Effective system prompt text.
 * @param enabledExtensionCount Number of enabled extensions (pre-computed).
 * @param enabledMiniAppCount Number of enabled mini-apps (pre-computed).
 * @returns Startup hero status summary.
 */
export function getStartupHeroStatus(
	systemPrompt: string,
	enabledExtensionCount: number,
	enabledMiniAppCount: number,
): StartupHeroStatus {
	return {
		activeSkillCount: countActiveSkillsInSystemPrompt(systemPrompt),
		agentsMdLoaded: isAgentsMdLoadedInSystemPrompt(systemPrompt),
		enabledExtensionCount,
		enabledMiniAppCount,
	};
}
