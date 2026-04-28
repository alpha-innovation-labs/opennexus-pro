import type { StartupHeroStatus } from "./types.js";

/**
 * Formats skill and AGENTS.md startup status for the hero block.
 *
 * @param status Startup hero status summary.
 * @returns Human-readable status line.
 */
export function formatStartupHeroStatus(status: StartupHeroStatus): string {
	const agentsIcon = status.agentsMdLoaded ? "✓" : "✗";
	return `Skills (${status.activeSkillCount}) ✓  AGENTS.md ${agentsIcon}`;
}
