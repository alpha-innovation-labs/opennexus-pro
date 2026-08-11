import type { Component, TUI } from "@earendil-works/pi-tui";
import { buildCenteredStartupHeroLines } from "./buildCenteredStartupHeroLines";
import type { StartupHeroStatus, StartupHeroTheme } from "./types";

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
	let cachedKey: string | undefined;
	let cachedLines: string[] = [];
	return {
		/**
		 * Renders the startup hero for the current terminal dimensions.
		 *
		 * @param width Current render width.
		 * @returns Startup hero lines.
		 */
		render(width: number): string[] {
			const key = [
				tui.terminal.rows,
				width,
				version,
				status.activeSkillCount,
				status.agentsMdLoaded,
				status.enabledExtensionCount,
				status.enabledMiniAppCount,
				startupDurationBadge ?? "",
			].join("\u001f");
			if (cachedKey === key) return cachedLines;
			cachedKey = key;
			cachedLines = buildCenteredStartupHeroLines(
				theme,
				tui.terminal.rows,
				width,
				version,
				status,
				startupDurationBadge,
			);
			return cachedLines;
		},
		/** Invalidates cached rendering state. */
		invalidate(): void {
			cachedKey = undefined;
			cachedLines = [];
		},
	};
}
