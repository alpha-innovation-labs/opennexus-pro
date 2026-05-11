import type { Component, TUI } from "@earendil-works/pi-tui";
import { buildCenteredStartupHeroLines } from "./buildCenteredStartupHeroLines.js";
import type { StartupHeroStatus, StartupHeroTheme } from "./types.js";

/**
 * Creates the height-aware startup hero widget shown above the editor.
 *
 * @param tui Active TUI instance.
 * @param theme UI theme formatter.
 * @param version Nexus package version.
 * @param status Startup status summary.
 * @param startupDurationBadge Optional startup duration badge.
 * @returns Component that renders the padded startup hero.
 */
export function createStartupHeroWidget(
	tui: TUI,
	theme: StartupHeroTheme,
	version: string,
	status: StartupHeroStatus,
	startupDurationBadge?: string,
): Component {
	return {
		/**
		 * Renders the startup hero for the current terminal dimensions.
		 *
		 * @param width Current render width.
		 * @returns Startup hero lines.
		 */
		render(width: number): string[] {
			return buildCenteredStartupHeroLines(theme, tui.terminal.rows, width, version, status, startupDurationBadge);
		},
		/** Invalidates cached rendering state. */
		invalidate(): void {},
	};
}
