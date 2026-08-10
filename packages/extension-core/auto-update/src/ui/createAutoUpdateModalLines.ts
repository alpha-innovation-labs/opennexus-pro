import type { SharedModalPane, SharedModalTheme } from "@nexus/tui-kit/modal/index.js";

export type AutoUpdateModalLinesInput = {
	currentVersion: string;
	latestVersion: string;
	packageName: string;
	theme: SharedModalTheme;
};

/**
 * Creates the auto-update modal body pane lines.
 *
 * @param input Version and package values shown to the user.
 * @returns Shared modal pane content.
 */
export function createAutoUpdateModalLines(input: AutoUpdateModalLinesInput): SharedModalPane[] {
	return [{
		id: "auto-update",
		size: 1,
		lines: [
			`Current: ${input.theme.fg("error", input.currentVersion)}`,
			`Latest: ${input.theme.fg("syntaxType", input.latestVersion)}`,
		],
	}];
}
