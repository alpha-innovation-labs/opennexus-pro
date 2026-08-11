import { visibleWidth } from "@earendil-works/pi-tui";
import { buildStartupHeroLines } from "./buildStartupHeroLines";
import { buildStartupHeroLogoLines } from "./buildStartupHeroLogoLines";
import { calculateStartupHeroTopPadding } from "./calculateStartupHeroTopPadding";
import { centerStartupHeroLines } from "./centerStartupHeroLines";
import type { StartupHeroStatus, StartupHeroTheme } from "./types";

const STARTUP_HERO_BOTTOM_PADDING_LINES = 1;

/**
 * Builds startup hero lines with vertical padding that centers the first prompt.
 *
 * @param theme UI theme formatter.
 * @param terminalRows Current terminal row count.
 * @param terminalColumns Current terminal column count.
 * @param version Nexus package version.
 * @param status Startup status summary.
 * @param startupDurationBadge Optional startup duration badge.
 * @returns Padded and centered startup hero lines.
 */
export function buildCenteredStartupHeroLines(
	theme: StartupHeroTheme,
	terminalRows: number,
	terminalColumns: number,
	version: string,
	status: StartupHeroStatus,
	startupDurationBadge?: string,
): string[] {
	const logoLines = buildStartupHeroLogoLines(theme);
	const logoWidth = Math.max(0, ...logoLines.map((line) => visibleWidth(line)));
	if (logoWidth > terminalColumns) return [];

	const heroLines = centerStartupHeroLines(
		buildStartupHeroLines(
			theme,
			version,
			status,
			terminalColumns,
			startupDurationBadge,
		),
		terminalColumns,
	);
	const emptyFullWidthLine = " ".repeat(terminalColumns);
	const bottomPaddingLines = Array.from(
		{ length: STARTUP_HERO_BOTTOM_PADDING_LINES },
		() => emptyFullWidthLine,
	);
	const topPaddingLineCount = calculateStartupHeroTopPadding(
		terminalRows,
		heroLines.length + bottomPaddingLines.length,
	);
	return [
		...Array.from({ length: topPaddingLineCount }, () => emptyFullWidthLine),
		...heroLines,
		...bottomPaddingLines,
	];
}
