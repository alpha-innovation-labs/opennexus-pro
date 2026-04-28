import type { StartupHeroStatus } from "./types.js";

/**
 * Formats skill and AGENTS.md startup status for the hero block.
 *
 * @param status Startup hero status summary.
 * @returns Human-readable status line.
 */
export function formatStartupHeroStatus(status: StartupHeroStatus): string {
	const skillLabel = status.activeSkillCount === 1 ? "skill" : "skills";
	const agentsLabel = status.agentsMdLoaded ? "AGENTS.md active" : "AGENTS.md inactive";
	return `${status.activeSkillCount} active ${skillLabel} • ${agentsLabel}`;
}
