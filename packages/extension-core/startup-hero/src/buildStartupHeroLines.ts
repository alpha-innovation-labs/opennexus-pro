import { buildStartupHeroLogoLines } from "./buildStartupHeroLogoLines.js";
import { buildStartupHeroStatusLines } from "./buildStartupHeroStatusLines.js";
import { buildStartupHeroVersionLine } from "./buildStartupHeroVersionLine.js";
import type { StartupHeroStatus, StartupHeroTheme } from "./types.js";

const NEXUS_AGENT_LABEL_ENV_VAR = "NEXUS_AGENT_LABEL";

/**
 * Builds the full startup hero block below the logo.
 *
 * When the active agent label is "Nexus dev", appends a small
 * "dev" badge line between the logo block and the version/status content.
 *
 * @param theme UI theme formatter.
 * @param version Nexus package version.
 * @param status Startup status summary.
 * @param width Maximum visible content width.
 * @param startupDurationBadge Optional startup duration badge.
 * @returns Padded and centered startup hero lines.
 */
export function buildStartupHeroLines(
	theme: StartupHeroTheme,
	version: string,
	status: StartupHeroStatus,
	width: number,
	startupDurationBadge?: string,
): string[] {
	const statusLines = buildStartupHeroStatusLines(theme, status, width);
	const agentLabel = process.env[NEXUS_AGENT_LABEL_ENV_VAR]?.trim();
	const devBadge = agentLabel === "Nexus dev" ? theme.fg("muted", "  dev") : undefined;
	return [
		...buildStartupHeroLogoLines(theme),
		...(devBadge ? [devBadge] : []),
		"",
		buildStartupHeroVersionLine(theme, version, width, startupDurationBadge),
		"",
		...statusLines,
	];
}
