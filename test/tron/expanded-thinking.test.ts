import type { AssistantMessage } from "@earendil-works/pi-ai";
import { AssistantMessageComponent } from "@earendil-works/pi-coding-agent";
import { TuiAltScreen, Text, stripTerminalSequences, visibleWidth, type MarkdownTheme, type TuiMouseEvent } from "@earendil-works/pi-tui";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setAssistantMessageUpdateHook } from "../../packages/pi-platform/src/assistantMessageHook";
import { resetAssistantActivityGrouping } from "../../packages/extension-core/tron/src/activity/resetAssistantActivityGrouping";
import { bridgedToolCallIds } from "../../packages/extension-core/tron/src/activity/state";
import { installAssistantThinkingStyle } from "../../packages/extension-core/tron/src/thinking/installAssistantThinkingStyle";

const identity = (text: string) => text;
const markdownTheme: MarkdownTheme = {
	heading: identity, link: identity, linkUrl: identity, code: identity,
	codeBlock: identity, codeBlockBorder: identity, quote: identity,
	quoteBorder: identity, hr: identity, listBullet: identity, bold: identity,
	italic: identity, strikethrough: identity, underline: identity,
};
const themeKey = Symbol.for("@earendil-works/pi-coding-agent:theme");
const globals = globalThis as Record<symbol, unknown>;
let previousTheme: unknown;
beforeEach(() => {
	previousTheme = globals[themeKey];
	globals[themeKey] = {
		fg: (_color: string, text: string) => text,
		bg: (_color: string, text: string) => text,
		bold: identity, italic: identity,
	};
	resetAssistantActivityGrouping();
	installAssistantThinkingStyle();
});
afterEach(() => {
	setAssistantMessageUpdateHook(undefined);
	resetAssistantActivityGrouping();
	globals[themeKey] = previousTheme;
});

const thinking = { type: "thinking" as const, thinking: "Inspect carefully.\n\nMore reasoning with 界 and **details**." };
const tool = { type: "toolCall" as const, id: "thinking-tool", name: "read", arguments: { path: "file.ts" } };
function component(content: AssistantMessage["content"], hidden = false) {
	return new AssistantMessageComponent({ role: "assistant", content, stopReason: "toolUse" } as AssistantMessage, hidden, markdownTheme);
}
function linesOf(component: AssistantMessageComponent, width = 40) {
	return component.render(width).map(stripTerminalSequences).filter(line => line.trim());
}

function click(view: AssistantMessageComponent, y: number, overrides: Partial<TuiMouseEvent> = {}) {
	const lines = view.render(40);
	return view.handleMouse({ type: "click", button: "left", x: 2, y, screenX: 2, screenY: y,
		width: 40, height: lines.length, shift: false, alt: false, ctrl: false, ...overrides });
}

describe("thinking-box mouse toggle", () => {
	it.each([
		{ name: "header", x: 2, y: 0 },
		{ name: "text", x: 8, y: 1 },
		{ name: "blank body row", x: 20, y: 2 },
		{ name: "left border", x: 0, y: 1 },
		{ name: "right border", x: 39, y: 1 },
		{ name: "bottom border", x: 2, y: -1 },
	])("collapses expanded thinking when clicking its $name", ({ x, y }) => {
		const view = component([thinking]);
		const before = view.render(40);
		expect(click(view, y < 0 ? before.length - 1 : y, { x })).toMatchObject({ handled: true });
		expect(linesOf(view).join("\n")).not.toContain("Inspect carefully");
		expect(view.render(40).length).toBeLessThan(before.length);
		click(view, 1);
		expect(linesOf(view).join("\n")).toContain("Inspect carefully");
	});

	it("toggles only the clicked box and retains state through streaming and resize", () => {
		const second = { ...thinking, thinking: "Second preview.\n\nSecond detail." };
		const view = component([thinking, second], true);
		expect(click(view, 1)).toMatchObject({ handled: true, render: true });
		expect(linesOf(view).join("\n")).toContain("Inspect carefully");
		expect(linesOf(view).join("\n")).not.toContain("Second preview");
		view.updateContent({ role: "assistant", content: [
			{ ...thinking, thinking: thinking.thinking + "\n\nStreaming continuation." }, second,
		], stopReason: "toolUse" } as AssistantMessage);
		view.invalidate();
		expect(linesOf(view, 60).join("\n")).toContain("Streaming continuation");
		const rows = view.render(40).map(stripTerminalSequences);
		const secondY = rows.findIndex(line => line.includes("Second detail"));
		click(view, secondY);
		expect(linesOf(view).join("\n")).toContain("Second preview");
		click(view, 1);
		expect(linesOf(view).join("\n")).not.toContain("Inspect carefully");
		expect(linesOf(view).join("\n")).toContain("Second preview");
	});

	it("lets the keyboard/global setting clear per-box overrides", () => {
		const view = component([thinking], true);
		click(view, 1);
		view.setHideThinkingBlock(true);
		expect(linesOf(view).join("\n")).not.toContain("Inspect carefully");
		view.setHideThinkingBlock(false);
		click(view, 1);
		expect(linesOf(view).join("\n")).not.toContain("Inspect carefully");
		view.setHideThinkingBlock(false);
		expect(linesOf(view).join("\n")).toContain("Inspect carefully");
	});

	it("ignores non-clicks, other buttons, adjacent text and the previous tool's wall", () => {
		const view = component([tool, thinking, { type: "text", text: "Answer" }], true);
		for (const type of ["press", "release", "drag", "move", "wheel"] as const) click(view, 2, { type });
		click(view, 2, { button: "right" });
		click(view, 0);
		const textRow = view.render(40).map(stripTerminalSequences).findIndex(line => line.includes("Answer"));
		click(view, textRow);
		expect(linesOf(view).join("\n")).not.toContain("Inspect carefully");
		click(view, 2);
		expect(linesOf(view).join("\n")).toContain("Inspect carefully");
		const rows = linesOf(view);
		const join = rows.findIndex(line => /^├─+┤$/.test(line));
		expect(rows[join + 1]).toContain("│ Answer");
	});

	it("handles actual fullscreen clicks without changing focus or toggling on drags", () => {
		let send: (data: string) => void = () => {};
		const terminal: any = { columns: 40, rows: 24, kittyProtocolActive: true,
			start: (fn: typeof send) => { send = fn; }, stop() {}, write() {}, hideCursor() {}, showCursor() {},
			moveBy() {}, clearLine() {}, clearFromCursor() {}, clearScreen() {}, setTitle() {} };
		const tui = new TuiAltScreen(terminal);
		const view = component([thinking], true);
		const editor = new Text("editor", 0, 0);
		tui.addChild(view); tui.addChild(editor); tui.setFocus(editor); tui.start();
		try {
			tui.renderNow();
			send("\x1b[<0;3;2M");
			expect(linesOf(view).join("\n")).not.toContain("Inspect carefully");
			send("\x1b[<0;3;2m");
			expect(linesOf(view).join("\n")).toContain("Inspect carefully");
			expect(tui.getFocusedComponent()).toBe(editor);
			tui.renderNow();
			send("\x1b[<0;3;2M"); send("\x1b[<32;8;2M"); send("\x1b[<0;8;2m");
			expect(linesOf(view).join("\n")).toContain("Inspect carefully");
			tui.renderNow();
			send("\x1b[<0;3;2M"); send("\x1b[<0;3;2m");
			expect(linesOf(view).join("\n")).not.toContain("Inspect carefully");
		} finally { tui.stop({ preserveScreen: true }); }
	});
});

describe("expanded thinking frame", () => {
	it("retains a border and top-left icon across the Ctrl+T visibility toggle", () => {
		const view = component([thinking], true);
		expect(linesOf(view)[0]).toMatch(/^┌─+┐$/);
		view.setHideThinkingBlock(false);
		const lines = linesOf(view);
		expect(lines[0]).toMatch(/^┌ 󰧑 ─+┐$/);
		expect(lines.at(-1)).toMatch(/^└─+┘$/);
		expect(lines.slice(1, -1).every(line => /^│.*│$/.test(line))).toBe(true);
		expect(lines.join("\n")).toContain("More reasoning");
		view.setHideThinkingBlock(true);
		expect(linesOf(view)[0]).toMatch(/^┌─+┐$/);
		view.setHideThinkingBlock(false);
		expect(linesOf(view)).toEqual(lines);
	});

	it("shares one wall with following assistant text without a gap", () => {
		const view = component([thinking, { type: "text", text: "The answer" }]);
		const lines = view.render(40).map(stripTerminalSequences);
		expect(lines.filter(line => line.startsWith("┌"))).toHaveLength(1);
		const join = lines.findIndex(line => /^├─+┤$/.test(line));
		expect(join).toBeGreaterThan(0);
		expect(lines[join + 1]).toContain("│ The answer");
		expect(lines.filter(line => /^└─+┘$/.test(line))).toHaveLength(1);
	});

	it("opens the bottom wall into a bridged tool", () => {
		const lines = linesOf(component([thinking, tool]));
		expect(lines[0]).toContain("󰧑");
		expect(lines.at(-1)).toMatch(/^├─+┤$/);
		expect(bridgedToolCallIds.has(tool.id)).toBe(true);
	});

	it("closes the preceding tool frame before its icon header", () => {
		const lines = linesOf(component([tool, thinking]));
		expect(lines[0]).toMatch(/^└─+┘$/);
		expect(lines[1]).toMatch(/^┌ 󰧑 ─+┐$/);
	});

	it.each([1, 2, 8, 24, 60])("fits terminal width %s after resize and invalidation", width => {
		const view = component([thinking]);
		view.render(80);
		view.invalidate();
		const lines = linesOf(view, width);
		expect(lines.every(line => visibleWidth(line) <= width)).toBe(true);
		if (width >= 8) expect(lines.every(line => visibleWidth(line) === width)).toBe(true);
	});
});
