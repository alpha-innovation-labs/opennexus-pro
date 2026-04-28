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
	const skillIcon = skillActive ? "✓" : "✗";
	const agentsIcon = status.agentsMdLoaded ? "✓" : "✗";
	const skillColor = skillActive ? "syntaxType" : "error";
	const agentsColor = status.agentsMdLoaded ? "syntaxType" : "error";
	const line = `Skills (${status.activeSkillCount}) ${theme.fg(skillColor, skillIcon)}  AGENTS.md ${theme.fg(agentsColor, agentsIcon)}`;
	return truncateToWidth(line, width, "…");
}
