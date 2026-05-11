import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { buildStartupHeroStatusItems } from "./buildStartupHeroStatusItems.js";
import type { StartupHeroStatus, StartupHeroTheme } from "./types.js";

const STARTUP_HERO_STATUS_SEPARATOR = "  ";

/**
 * Builds wrapped startup hero status lines without truncating whole status groups.
 *
 * @param theme UI theme formatter.
 * @param status Startup status summary.
 * @param width Maximum visible width.
 * @returns Styled startup status lines.
 */
export function buildStartupHeroStatusLines(theme: StartupHeroTheme, status: StartupHeroStatus, width: number): string[] {
	const items = buildStartupHeroStatusItems(theme, status);
	const lines: string[] = [];
	let currentLine = "";

	for (const item of items) {
		const candidate = currentLine ? `${currentLine}${STARTUP_HERO_STATUS_SEPARATOR}${item}` : item;
		if (currentLine && visibleWidth(candidate) > width) {
			lines.push(currentLine);
			currentLine = item;
			continue;
		}
		currentLine = candidate;
	}

	if (currentLine) lines.push(currentLine);
	return lines.map((line) => truncateToWidth(line, width, "…"));
}
