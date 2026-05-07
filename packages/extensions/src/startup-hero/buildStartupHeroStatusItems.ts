import type { StartupHeroStatus, StartupHeroTheme } from "./types.js";

/**
 * Builds colored startup hero status item segments.
 *
 * @param theme UI theme formatter.
 * @param status Startup status summary.
 * @returns Colored status item segments.
 */
export function buildStartupHeroStatusItems(theme: StartupHeroTheme, status: StartupHeroStatus): string[] {
	const skillActive = status.activeSkillCount > 0;
	const skillStatusIcon = skillActive ? "✓" : "✗";
	const agentsStatusIcon = status.agentsMdLoaded ? "✓" : "✗";
	const extensionStatusIcon = status.enabledExtensionCount > 0 ? "✓" : "✗";
	const miniAppStatusIcon = status.enabledMiniAppCount > 0 ? "✓" : "✗";
	const skillColor = skillActive ? "syntaxType" : "error";
	const agentsColor = status.agentsMdLoaded ? "syntaxType" : "error";
	const extensionColor = status.enabledExtensionCount > 0 ? "syntaxType" : "error";
	const miniAppColor = status.enabledMiniAppCount > 0 ? "syntaxType" : "error";
	return [
		`󰧑 Skills (${status.activeSkillCount}) ${theme.fg(skillColor, skillStatusIcon)}`,
		` AGENTS.md ${theme.fg(agentsColor, agentsStatusIcon)}`,
		` Extensions (${status.enabledExtensionCount}) ${theme.fg(extensionColor, extensionStatusIcon)}`,
		`󱂬 Mini-Apps (${status.enabledMiniAppCount}) ${theme.fg(miniAppColor, miniAppStatusIcon)}`,
	];
}
