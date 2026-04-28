import { truncateToWidth } from "@mariozechner/pi-tui";
import { startupHeroTips } from "./startupHeroTips.js";
import type { StartupHeroTheme } from "./types.js";

/**
 * Builds the startup hero TIP section.
 *
 * @param theme UI theme formatter.
 * @param width Maximum visible width.
 * @returns Styled TIP section lines.
 */
export function buildStartupHeroTipLines(theme: StartupHeroTheme, width: number): string[] {
	const title = theme.fg("accent", theme.bold ? theme.bold("TIP") : "TIP");
	const tips = startupHeroTips.map((tip) => theme.fg("foreground", truncateToWidth(`• ${tip}`, width, "…")));
	return [title, ...tips];
}
