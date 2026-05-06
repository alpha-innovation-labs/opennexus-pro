import { truncateToWidth } from "@mariozechner/pi-tui";
import type { StartupHeroStatus, StartupHeroTheme } from "./types.js";

/**
 * Builds the startup hero status line with colored availability icons.
 *
 * @param theme UI theme formatter.
 * @param status Startup status summary.
 * @param width Maximum visible width.
 * @returns Styled startup status line.
 */
export function buildStartupHeroStatusLine(theme: StartupHeroTheme, status: StartupHeroStatus, width: number): string {
	const skillActive = status.activeSkillCount > 0;
	const skillStatusIcon = skillActive ? "✓" : "✗";
	const agentsStatusIcon = status.agentsMdLoaded ? "✓" : "✗";
	const extensionStatusIcon = status.enabledExtensionCount > 0 ? "✓" : "✗";
	const miniAppStatusIcon = status.enabledMiniAppCount > 0 ? "✓" : "✗";
	const skillColor = skillActive ? "syntaxType" : "error";
	const agentsColor = status.agentsMdLoaded ? "syntaxType" : "error";
	const extensionColor = status.enabledExtensionCount > 0 ? "syntaxType" : "error";
	const miniAppColor = status.enabledMiniAppCount > 0 ? "syntaxType" : "error";
	const line = [
		`󰧑 Skills (${status.activeSkillCount}) ${theme.fg(skillColor, skillStatusIcon)}`,
		` AGENTS.md ${theme.fg(agentsColor, agentsStatusIcon)}`,
		` Extensions (${status.enabledExtensionCount}) ${theme.fg(extensionColor, extensionStatusIcon)}`,
		`󱂬 Mini-Apps (${status.enabledMiniAppCount}) ${theme.fg(miniAppColor, miniAppStatusIcon)}`,
	].join("  ");
	return truncateToWidth(line, width, "…");
}
