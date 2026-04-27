import type { Component, TUI } from "@mariozechner/pi-tui";
import { buildCenteredStartupLogoLines } from "./buildCenteredStartupLogoLines.js";

/**
 * Creates the height-aware startup logo widget shown above the editor.
 *
 * @param tui Active TUI instance.
 * @param theme UI theme formatter.
 * @returns Component that renders the padded startup logo.
 */
export function createStartupLogoWidget(
	tui: TUI,
	theme: { fg(name: string, value: string): string },
): Component {
	return {
		/**
		 * Renders the startup logo for the current terminal dimensions.
		 *
		 * @param width Current render width.
		 * @returns Startup logo lines.
		 */
		render(width: number): string[] {
			return buildCenteredStartupLogoLines(theme, tui.terminal.rows, width);
		},
		/** Invalidates cached rendering state. */
		invalidate(): void {},
	};
}
