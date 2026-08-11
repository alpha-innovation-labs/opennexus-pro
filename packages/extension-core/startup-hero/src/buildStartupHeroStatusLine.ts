import { truncateToWidth } from "@earendil-works/pi-tui";
import { buildStartupHeroStatusItems } from "./buildStartupHeroStatusItems";
import type { StartupHeroStatus, StartupHeroTheme } from "./types";

/**
 * Builds the startup hero status line with colored availability icons.
 *
 * @param theme UI theme formatter.
 * @param status Startup status summary.
 * @param width Maximum visible width.
 * @returns Styled startup status line.
 */
export function buildStartupHeroStatusLine(
	theme: StartupHeroTheme,
	status: StartupHeroStatus,
	width: number,
): string {
	return truncateToWidth(
		buildStartupHeroStatusItems(theme, status).join("  "),
		width,
		"…",
	);
}
