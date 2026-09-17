import { visibleWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { measureTronRender } from "../profiling/measureTronRender";

/**
 * Compact Tron-style bordered row for assistant provider errors.
 *
 * Rendered as a fully closed box (top and bottom borders included) so it reads
 * as a standalone error card, visually separated from the bordered thinking /
 * text / tool blocks that precede it.
 */
export class BorderedAssistantErrorRow {
	constructor(
		private readonly theme: { fg(color: string, text: string): string },
		private readonly errorText: string,
	) {}

	/**
	 * Renders the bordered error box.
	 *
	 * @param width Available width.
	 * @returns Rendered box lines.
	 */
	render(width: number): string[] {
		return measureTronRender(
			"bordered-assistant-error-row",
			() => {
				const innerWidth = Math.max(1, width - 2);
				const wrappedLines = wrapTextWithAnsi(this.errorText, innerWidth);
				const border = (t: string) => this.theme.fg("error", t);

				const lines: string[] = [border(`╭${"─".repeat(innerWidth)}╮`)];
				for (const line of wrappedLines) {
					const padding = " ".repeat(
						Math.max(0, innerWidth - visibleWidth(line)),
					);
					lines.push(
						`${border("│")}${this.theme.fg("error", `${line}${padding}`)}${border("│")}`,
					);
				}
				lines.push(border(`╰${"─".repeat(innerWidth)}╯`));
				return lines;
			},
			{ width, errorLength: this.errorText.length },
		);
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
