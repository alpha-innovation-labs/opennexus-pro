/**
 * Verifies the bordered assistant text and the standalone bordered error box.
 *
 * Covers the connection modes that let assistant text join a bordered chain
 * with the thinking block above and tool calls below, plus the fully closed
 * error box.
 */
import { visibleWidth } from "@earendil-works/pi-tui";
import type { MarkdownTheme } from "@earendil-works/pi-tui";
import { beforeAll, describe, expect, it } from "vitest";
import { BorderedAssistantErrorRow } from "../../packages/extension-core/tron/src/thinking/BorderedAssistantErrorRow";
import { BorderedAssistantText } from "../../packages/extension-core/tron/src/thinking/BorderedAssistantText";

const THEME_KEY = Symbol.for("@earendil-works/pi-coding-agent:theme");

beforeAll(() => {
	(globalThis as Record<symbol, unknown>)[THEME_KEY] = {
		fg: (_c: string, t: string) => t,
		bold: (t: string) => t,
		italic: (t: string) => t,
	};
});

/** Strip all ANSI sequences for structural assertions. */
const ESC = "\x1b";
const ANSI_RE = new RegExp(`${ESC}\\[[0-9;]*m`, "g");
function plain(text: string): string {
	return text.replace(ANSI_RE, "");
}

/** A minimal MarkdownTheme that renders text verbatim. */
const identity = (t: string) => t;
const mdTheme: MarkdownTheme = {
	heading: identity,
	link: identity,
	linkUrl: identity,
	code: identity,
	codeBlock: identity,
	codeBlockBorder: identity,
	quote: identity,
	quoteBorder: identity,
	hr: identity,
	listBullet: identity,
	bold: identity,
	italic: identity,
	strikethrough: identity,
	underline: identity,
};

function makeText(
	text: string,
	connectFromThinking = false,
	connectToTools = false,
): BorderedAssistantText {
	return new BorderedAssistantText(text, connectFromThinking, connectToTools, mdTheme);
}

describe("BorderedAssistantText", () => {
	it("renders a fully closed box when standalone", () => {
		const lines = makeText("hello", false, false).render(40);
		expect(plain(lines[0])).toMatch(/^╭─+╮$/);
		expect(plain(lines[lines.length - 1])).toMatch(/^╰─+╯$/);
	});

	it("suppresses the top border when sharing the thinking wall", () => {
		const lines = makeText("hello", true, false).render(40);
		// No ╭╮ top line; the first line is a side-walled content row.
		expect(lines.some((l) => plain(l).includes("╮"))).toBe(false);
		expect(plain(lines[0])).toMatch(/^│.*│$/);
		expect(plain(lines[lines.length - 1])).toMatch(/^╰─+╯$/);
	});

	it("opens the bottom wall into tools", () => {
		const lines = makeText("hello", false, true).render(40);
		expect(plain(lines[lines.length - 1])).toMatch(/^├─+┤$/);
	});

	it("keeps every row the same width", () => {
		const lines = makeText("a long assistant reply with words", 24, false, false).render(24);
		const width = visibleWidth(lines[0]);
		for (const line of lines) expect(visibleWidth(line)).toBe(width);
	});
});

describe("BorderedAssistantErrorRow", () => {
	it("renders a fully closed standalone box", () => {
		const row = new BorderedAssistantErrorRow(
			{ fg: (_c, t) => t } as never,
			"provider error: timeout",
		);
		const lines = row.render(40);
		expect(plain(lines[0])).toMatch(/^╭─+╮$/);
		expect(plain(lines[lines.length - 1])).toMatch(/^╰─+╯$/);
		expect(plain(lines[1])).toContain("provider error: timeout");
	});
});
