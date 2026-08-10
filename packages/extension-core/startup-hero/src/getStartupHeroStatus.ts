import { countActiveSkillsInSystemPrompt } from "./countActiveSkillsInSystemPrompt";
import { countEnabledStartupHeroExtensions } from "./countEnabledStartupHeroExtensions";
import { countEnabledStartupHeroMiniApps } from "./countEnabledStartupHeroMiniApps";
import { isAgentsMdLoadedInSystemPrompt } from "./isAgentsMdLoadedInSystemPrompt";
import type { StartupHeroStatus } from "./types";

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
