import { buildStartupHeroLogoLines } from "./buildStartupHeroLogoLines.js";
import { buildStartupHeroStatusLines } from "./buildStartupHeroStatusLines.js";
import { buildStartupHeroVersionLine } from "./buildStartupHeroVersionLine.js";
import type { StartupHeroStatus, StartupHeroTheme } from "./types.js";

/**
 * Builds the full startup hero block below the logo.
 *
 * @param theme UI theme formatter.
 * @param version Nexus package version.
 * @param status Startup status summary.
 * @param width Maximum visible content width.
 * @param startupDurationBadge Optional startup duration badge.
 * @returns Styled startup hero lines.
 */
export function buildStartupHeroLines(
	theme: StartupHeroTheme,
	version: string,
	status: StartupHeroStatus,
	width: number,
	startupDurationBadge?: string,
): string[] {
	const statusLines = buildStartupHeroStatusLines(theme, status, width);
	return [
		...buildStartupHeroLogoLines(theme),
		"",
		buildStartupHeroVersionLine(theme, version, width, startupDurationBadge),
		"",
		...statusLines,
	];
}
