import type { AssistantMessage } from "@earendil-works/pi-ai";
import { AssistantMessageComponent } from "@earendil-works/pi-coding-agent";
import { stripTerminalSequences, visibleWidth, type MarkdownTheme } from "@earendil-works/pi-tui";
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
