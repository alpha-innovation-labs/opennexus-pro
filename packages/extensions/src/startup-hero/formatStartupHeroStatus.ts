import type { StartupHeroStatus } from "./types.js";

/**
 * Formats skill, AGENTS.md, and extension startup status for the hero block.
 *
 * @param status Startup hero status summary.
 * @returns Human-readable status line.
 */
export function formatStartupHeroStatus(status: StartupHeroStatus): string {
	const skillIcon = status.activeSkillCount > 0 ? "✓" : "✗";
	const agentsIcon = status.agentsMdLoaded ? "✓" : "✗";
	const extensionIcon = status.enabledExtensionCount > 0 ? "✓" : "✗";
	const miniAppIcon = status.enabledMiniAppCount > 0 ? "✓" : "✗";
	return `󰧑 Skills (${status.activeSkillCount}) ${skillIcon}   AGENTS.md ${agentsIcon}   Extensions (${status.enabledExtensionCount}) ${extensionIcon}  󱂬 Mini-Apps (${status.enabledMiniAppCount}) ${miniAppIcon}`;
}
