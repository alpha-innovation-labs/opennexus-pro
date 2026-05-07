import { padTetrisLine } from "./padTetrisLine.js";
import { stripTetrisAnsi } from "./stripTetrisAnsi.js";

/**
 * Renders a modal-style boxed panel for Tetris side content.
 *
 * @param theme Active UI theme.
 * @param title Panel title.
 * @param lines Panel body lines.
 * @param width Target panel width.
 * @param height Target panel height.
 * @returns Boxed panel lines.
 */
export function renderTetrisBox(theme: any, title: string, lines: string[], width: number, height: number): string[] {
	const innerWidth = Math.max(1, width - 2);
	const titleText = ` ${title} `;
	const top = theme.fg("borderMuted", `┌${titleText}${"─".repeat(Math.max(0, innerWidth - titleText.length))}┐`);
	const bottom = theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`);
	const bodyHeight = Math.max(0, height - 2);
	const body = lines.slice(0, bodyHeight).map((line) => `${theme.fg("borderMuted", "│")}${padTetrisLine(stripTetrisAnsi(line), innerWidth)}${theme.fg("borderMuted", "│")}`);
	while (body.length < bodyHeight) body.push(`${theme.fg("borderMuted", "│")}${" ".repeat(innerWidth)}${theme.fg("borderMuted", "│")}`);
	return [top, ...body, bottom].slice(0, height);
}
