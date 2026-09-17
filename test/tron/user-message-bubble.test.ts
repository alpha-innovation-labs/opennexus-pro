/**
 * Verifies the tron user-message bubble renders Markdown content with the
 * same styling pipeline as the rest of tron (code spans, bold, etc.) while
 * keeping the compact bordered bubble design.
 */
import { visibleWidth } from "@earendil-works/pi-tui";
import { beforeAll, describe, expect, it } from "vitest";
import { renderCompactInputBubble } from "../../packages/extension-core/tron/src/user-message/renderCompactInputBubble";

const THEME_KEY = Symbol.for("@earendil-works/pi-coding-agent:theme");

const ansiByColor = new Map<string, string>();
let nextCode = 1;

function fg(color: string, text: string): string {
	const ansi = ansiByColor.get(color) ?? `\x1b[38;5;${nextCode++}m`;
	ansiByColor.set(color, ansi);
	return `${ansi}${text}\x1b[39m`;
}

/** Strips ANSI SGR sequences for structural assertions. */
const ESC = "\x1b";
const ANSI_SGR_RE = new RegExp(`${ESC}\\[[0-9;]*m`, "g");
function stripAnsi(text: string): string {
	return text.replace(ANSI_SGR_RE, "");
}

beforeAll(() => {
	(globalThis as Record<symbol, unknown>)[THEME_KEY] = {
		fg,
		bold: (t: string) => t,
		italic: (t: string) => t,
	};
});

describe("renderCompactInputBubble", () => {
	it("styles inline code spans with the mdCode color", () => {
		const lines = renderCompactInputBubble("whats' the `latest` version?", 40);
		const joined = lines.join("\n");
		const mdCodeAnsi = ansiByColor.get("mdCode");
		expect(mdCodeAnsi).toBeDefined();
		expect(joined).toContain(`${mdCodeAnsi}latest\x1b[39m`);
		expect(joined).not.toContain("`latest`");
		// Base content uses the text color.
		const textAnsi = ansiByColor.get("text");
		expect(textAnsi).toBeDefined();
		expect(joined).toContain(`${textAnsi} version?\x1b[39m`);
		// Plain-text echo is preserved (minus the markdown markers).
		expect(stripAnsi(lines[1])).toContain("whats' the");
	});

	it("keeps the bubble structure and aligned borders", () => {
		const lines = renderCompactInputBubble("hello **world** and `code`", 40);
		expect(stripAnsi(lines[0]).startsWith("╭")).toBe(true);
		expect(stripAnsi(lines[lines.length - 1]).startsWith("╰")).toBe(true);
		const width = visibleWidth(lines[0]);
		for (const line of lines) {
			expect(visibleWidth(line)).toBe(width);
		}
	});

	it("wraps long content inside the bubble", () => {
		const lines = renderCompactInputBubble(
			`a ${"word ".repeat(30)}`.trim(),
			30,
		);
		const width = visibleWidth(lines[0]);
		expect(lines.length).toBeGreaterThan(3);
		for (const line of lines) {
			expect(visibleWidth(line)).toBe(width);
		}
	});

	it("renders empty text as a prefix-only line", () => {
		const lines = renderCompactInputBubble("", 30);
		expect(lines).toHaveLength(3);
		expect(stripAnsi(lines[1])).toBe("│» │");
	});
});
