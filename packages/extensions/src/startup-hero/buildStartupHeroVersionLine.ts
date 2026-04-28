import { truncateToWidth } from "@mariozechner/pi-tui";
import type { StartupHeroTheme } from "./types.js";

/**
 * Builds the foreground-colored Nexus version line.
 *
 * @param theme UI theme formatter.
 * @param version Nexus package version.
 * @param width Maximum visible width.
 * @returns Styled version line.
 */
export function buildStartupHeroVersionLine(theme: StartupHeroTheme, version: string, width: number): string {
	return theme.fg("foreground", truncateToWidth(`Nexus v${version}`, width, "…"));
}
