import { truncateToWidth } from "@mariozechner/pi-tui";
import { buildStartupHeroStatusItems } from "./buildStartupHeroStatusItems.js";
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
	return truncateToWidth(buildStartupHeroStatusItems(theme, status).join("  "), width, "…");
}
