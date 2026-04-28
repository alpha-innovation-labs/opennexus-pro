import { buildStartupHeroLogoLines } from "./buildStartupHeroLogoLines.js";
import { buildStartupHeroStatusLine } from "./buildStartupHeroStatusLine.js";
import { buildStartupHeroTipLines } from "./buildStartupHeroTipLines.js";
import { buildStartupHeroVersionLine } from "./buildStartupHeroVersionLine.js";
import type { StartupHeroStatus, StartupHeroTheme } from "./types.js";

/**
 * Builds the full startup hero block below the logo.
 *
 * @param theme UI theme formatter.
 * @param version Nexus package version.
 * @param status Startup status summary.
 * @param width Maximum visible content width.
 * @param tip Startup tip selected for this session.
 * @returns Styled startup hero lines.
 */
export function buildStartupHeroLines(
	theme: StartupHeroTheme,
	version: string,
	status: StartupHeroStatus,
	width: number,
	tip: string,
): string[] {
	const statusLine = buildStartupHeroStatusLine(theme, status, width);
	return [
		...buildStartupHeroLogoLines(theme),
		"",
		buildStartupHeroVersionLine(theme, version, width),
		"",
		...buildStartupHeroTipLines(theme, width, tip),
		"",
		statusLine,
	];
}
