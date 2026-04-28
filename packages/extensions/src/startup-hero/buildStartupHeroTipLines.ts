import { truncateToWidth } from "@mariozechner/pi-tui";
import type { StartupHeroTheme } from "./types.js";

/**
 * Builds the startup hero TIP line.
 *
 * @param theme UI theme formatter.
 * @param width Maximum visible width.
 * @param tip Startup tip selected for this session.
 * @returns Styled single-line TIP section.
 */
export function buildStartupHeroTipLines(theme: StartupHeroTheme, width: number, tip: string): string[] {
	return [theme.fg("text", truncateToWidth(`TIP ${tip}`, width, "…"))];
}
