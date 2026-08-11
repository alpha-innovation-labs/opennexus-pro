import { truncateToWidth } from "@earendil-works/pi-tui";
import type { StartupHeroTheme } from "./types";

/**
 * Builds the text-colored Nexus version line.
 *
 * @param theme UI theme formatter.
 * @param version Nexus package version.
 * @param width Maximum visible width.
 * @param startupDurationBadge Optional startup duration badge.
 * @returns Styled version line.
 */
export function buildStartupHeroVersionLine(
	theme: StartupHeroTheme,
	version: string,
	width: number,
	startupDurationBadge?: string,
): string {
	const text = startupDurationBadge
		? `v${version} ${startupDurationBadge}`
		: `v${version}`;
	return theme.fg("thinkingText", truncateToWidth(text, width, "…"));
}
