import { visibleWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { measureTronRender } from "../profiling/measureTronRender";

/**
 * Compact Tron-style bordered row for assistant provider errors.
 */
export class BorderedAssistantErrorRow {
	constructor(
		private readonly theme: { fg(color: string, text: string): string },
		private readonly errorText: string,
	) {}

	/**
	 * Renders the bordered error row.
	 *
	 * @param width Available width.
	 * @returns Rendered row lines.
	 */
	render(width: number): string[] {
		return measureTronRender(
			"bordered-assistant-error-row",
			() => {
				const innerWidth = Math.max(1, width - 2);
				const wrappedLines = wrapTextWithAnsi(this.errorText, innerWidth);

				return wrappedLines.map((line) => {
					const padding = " ".repeat(
						Math.max(0, innerWidth - visibleWidth(line)),
					);
					return `${this.theme.fg("error", "│")}${this.theme.fg("error", `${line}${padding}`)}${this.theme.fg("error", "│")}`;
				});
			},
			{ width, errorLength: this.errorText.length },
		);
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
