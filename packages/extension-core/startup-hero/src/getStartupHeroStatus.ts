import { countActiveSkillsInSystemPrompt } from "./countActiveSkillsInSystemPrompt.js";
import { countEnabledStartupHeroExtensions } from "./countEnabledStartupHeroExtensions.js";
import { countEnabledStartupHeroMiniApps } from "./countEnabledStartupHeroMiniApps.js";
import { isAgentsMdLoadedInSystemPrompt } from "./isAgentsMdLoadedInSystemPrompt.js";
import type { StartupHeroStatus } from "./types.js";

/**
 * Builds startup hero status values from the effective system prompt.
 *
 * @param systemPrompt Effective system prompt text.
 * @returns Startup hero status summary.
 */
export function getStartupHeroStatus(systemPrompt: string): StartupHeroStatus {
	return {
		activeSkillCount: countActiveSkillsInSystemPrompt(systemPrompt),
		agentsMdLoaded: isAgentsMdLoadedInSystemPrompt(systemPrompt),
		enabledExtensionCount: countEnabledStartupHeroExtensions(),
		enabledMiniAppCount: countEnabledStartupHeroMiniApps(),
	};
}
