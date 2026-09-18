import { ToolExecutionComponent, type ToolDefinition } from "@earendil-works/pi-coding-agent";
import { MouseRegion, Text, TuiAltScreen, stripTerminalSequences, type TuiMouseEvent, type TUI } from "@earendil-works/pi-tui";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyToolExecutionSpacingPatch } from "../../packages/pi-platform/src/applyToolExecutionSpacingPatch";
import { createCompactToolDefinition } from "../../packages/extension-core/tron/src/compact-tool-lines/createCompactToolDefinition";
import { registerCompactBuiltInTool } from "../../packages/extension-core/tron/src/compact-tool-lines/registerCompactBuiltInTool";
import { resetAssistantActivityGrouping } from "../../packages/extension-core/tron/src/activity/resetAssistantActivityGrouping";

// Registration and real result renderers run, but no tool, shell, or RTK process runs.
vi.mock("../../packages/extension-core/tron/src/compact-tool-lines/getBuiltInTools", () => ({
	getBuiltInTools: () => Object.fromEntries(["bash", "read", "edit", "write", "find", "grep", "ls"]
		.map(name => [name, { description: "fixture", parameters: {}, execute: vi.fn() }])),
}));
const identity = (s: string) => s;
const theme = { fg: (_: string, s: string) => s, bg: (_: string, s: string) => s, bold: identity, italic: identity, inverse: identity, getBgAnsi: () => "" };
const themeKey = Symbol.for("@earendil-works/pi-coding-agent:theme");
let previousTheme: unknown;
const WIDTH = 72;
applyToolExecutionSpacingPatch();
beforeEach(() => {
	previousTheme = (globalThis as any)[themeKey];
	(globalThis as any)[themeKey] = theme;
	resetAssistantActivityGrouping();
});
afterEach(() => {
	(globalThis as any)[themeKey] = previousTheme;
	resetAssistantActivityGrouping();
});
function definition(name = "fixture"): ToolDefinition {
	return createCompactToolDefinition({
		name, label: name, description: "test", parameters: {} as never,
		execute: vi.fn(async () => ({ content: [], details: undefined })),
		renderCall: () => new Text(`${name} call`, 0, 0),
		renderResult: (result, options) => new Text(options.expanded
			? `DETAILS\n${result.content.filter(c => c.type === "text").map(c => c.text).join("\n")}`
			: "LIVE PROGRESS", 0, 0),
	} as ToolDefinition);
}
function tool(def = definition(), ui: Pick<TUI, "requestRender"> & { mode?: string } = { requestRender: vi.fn(), mode: "fullscreen" }, id = "test-call") {
	return new ToolExecutionComponent(def.name, id, { command: "echo fixture" }, {}, def, ui as unknown as TUI, "/tmp");
}
function result(row: ToolExecutionComponent, text = "output", partial = false) {
	row.updateResult({ content: [{ type: "text", text }], details: undefined, isError: false }, partial);
}
function lines(row: ToolExecutionComponent, width = WIDTH) { return row.render(width).map(stripTerminalSequences); }
function mouse(row: ToolExecutionComponent, y: number, overrides: Partial<TuiMouseEvent> = {}) {
	const rendered = row.render(WIDTH);
	return row.handleMouse({ type: "click", button: "left", x: 3, y, screenX: 3, screenY: y,
		width: WIDTH, height: rendered.length, shift: false, alt: false, ctrl: false, ...overrides });
}
function expanded(row: ToolExecutionComponent) { return lines(row).join("\n").includes("DETAILS"); }
function builtInDefinition(name: "edit" | "write"): ToolDefinition {
	let definition!: ToolDefinition;
	registerCompactBuiltInTool({ registerTool: (value: ToolDefinition) => { definition = value; } } as never, name);
	return definition;
}

describe("Tron tool-call mouse expansion", () => {
	it.each(["fixture", "Agent", "SubagentWorkflow"])("toggles %s from its first border, result body, and last border", name => {
		const def = definition(name);
		const row = tool(def);
		result(row);
		expect(lines(row)[0]).toMatch(/^┌/);
		expect(expanded(row)).toBe(false);
		expect(mouse(row, 0)).toMatchObject({ handled: true });
		expect(expanded(row)).toBe(true);
		mouse(row, lines(row).findIndex(line => line.includes("DETAILS")));
		expect(expanded(row)).toBe(false); // Output clicks collapse just like header clicks.
		mouse(row, lines(row).length - 1);
		expect(expanded(row)).toBe(true);
		mouse(row, lines(row).length - 1);
		expect(expanded(row)).toBe(false);
		expect(def.execute).not.toHaveBeenCalled();
	});

	const builtInCases = [
		{ name: "bash", args: { command: "echo fixture" }, output: "BASH OUTPUT", expected: "BASH OUTPUT" },
		{ name: "read", args: { path: "fixture.txt" }, output: "READ OUTPUT", expected: "READ OUTPUT" },
		{ name: "grep", args: { pattern: "fixture" }, output: "GREP OUTPUT", expected: "GREP OUTPUT" },
		{ name: "find", args: { pattern: "*.txt" }, output: "FOUND OUTPUT", expected: "FOUND OUTPUT" },
		{ name: "ls", args: { path: "." }, output: "LIST OUTPUT", expected: "LIST OUTPUT" },
		{ name: "write", args: { path: "fixture.txt", content: "first line\nWRITE CONTENT\n" + "tail\n".repeat(40) + "LAST LINE" }, output: "Successfully wrote fixture.txt", expected: "WRITE CONTENT" },
		{ name: "edit", args: { path: "fixture.txt", edits: [{ oldText: "old preview", newText: "replacement" }] }, output: "Successfully replaced text", details: { diff: "-1 OLD DIFF\n+1 EDIT DIFF", firstChangedLine: 1 }, expected: "EDIT DIFF" },
		{ name: "edit", args: { path: "fixture.txt", edits: [{ oldText: "old preview", newText: "EDIT WITHOUT DIFF" }, { oldText: "second old", newText: "SECOND REPLACEMENT" }] }, output: "Successfully replaced text", expected: "EDIT WITHOUT DIFF" },
		{ name: "edit", args: { path: "fixture.txt", oldText: "legacy old", newText: "LEGACY EDIT" }, output: "Successfully replaced text", expected: "LEGACY EDIT" },
		{ name: "write", args: { path: "fixture.txt", content: "" }, output: "Successfully wrote fixture.txt", expected: "[empty file]" },
	] as const;
	it.each(builtInCases)("expands actual $name details, not just its summary", fixture => {
		let def!: ToolDefinition;
		registerCompactBuiltInTool({ registerTool: (value: ToolDefinition) => { def = value; } } as never, fixture.name);
		const row = tool(def);
		row.updateArgs(fixture.args);
		row.updateResult({ content: [{ type: "text", text: fixture.output }], details: "details" in fixture ? fixture.details : undefined, isError: false });
		expect(lines(row).join("\n")).not.toContain(fixture.expected);
		for (let i = 0; i < 2; i++) {
			mouse(row, 0);
			expect(lines(row).join("\n")).toContain(fixture.expected);
			if (fixture.name === "write" && fixture.args.content) {
				expect(lines(row)).toHaveLength(23);
				expect(lines(row).join("\n")).not.toContain("LAST LINE");
				mouse(row, 3, { type: "wheel", button: "none", wheelDelta: 999 });
				expect(lines(row).join("\n")).toContain("LAST LINE");
				mouse(row, 3, { type: "wheel", button: "none", wheelDelta: -999 });
			}
			if (fixture.expected === "EDIT WITHOUT DIFF") expect(lines(row).join("\n")).toContain("SECOND REPLACEMENT");
			row.invalidate();
			expect(lines(row, 40).join("\n")).toContain(fixture.expected);
			mouse(row, lines(row).length - 1);
			expect(lines(row).join("\n")).not.toContain(fixture.expected);
		}
	});

	it.each(builtInCases.slice(0, 7))("caps and scrolls long registered $name output", fixture => {
		let def!: ToolDefinition;
		registerCompactBuiltInTool({ registerTool: (value: ToolDefinition) => { def = value; } } as never, fixture.name);
		const row = tool(def);
		const text = Array.from({ length: 100 }, (_, i) => `OUTPUT-${i}`).join("\n");
		row.updateArgs({ ...fixture.args, ...(fixture.name === "write" ? { content: text } : {}) });
		row.updateResult({ content: [{ type: "text", text }], details: fixture.name === "edit" ? { diff: text } : undefined, isError: false });
		row.setExpanded(true);
		const before = lines(row);
		expect(before).toHaveLength(23);
		expect(before.slice(2).join("\n")).not.toContain("OUTPUT-99");
		expect(mouse(row, 3, { type: "wheel", button: "none", wheelDelta: 999 })).toMatchObject({ handled: true });
		expect(lines(row).join("\n")).toContain("OUTPUT-99");
		row.invalidate();
		expect(lines(row).join("\n")).toContain("OUTPUT-99");
	});

	it.each(["edit", "write"] as const)("expands captured %s content through the extension wrapper too", name => {
		const nativeResult = vi.fn(() => new Text("", 0, 0));
		const nativeCall = vi.fn(() => new Text("native preview", 0, 0));
		const row = tool(createCompactToolDefinition({
			name, label: name, description: "fixture", parameters: {} as never, execute: vi.fn(),
			renderCall: nativeCall, renderResult: nativeResult,
		}));
		row.updateArgs({ path: "fixture.txt", content: "first\nCAPTURED CONTENT", edits: [{ oldText: "old", newText: "CAPTURED CONTENT" }] });
		result(row, "success");
		expect(lines(row).join("\n")).not.toContain("CAPTURED CONTENT");
		mouse(row, 0);
		expect(lines(row).join("\n")).toContain("CAPTURED CONTENT");
		row.invalidate();
		expect(lines(row).join("\n")).toContain("CAPTURED CONTENT");
		mouse(row, 0);
		expect(lines(row).join("\n")).not.toContain("CAPTURED CONTENT");
		expect(nativeCall).not.toHaveBeenCalled(); // In particular, no filesystem preview computation.
		expect(nativeResult).not.toHaveBeenCalled();
	});

	it.each(["edit", "write"] as const)("shows %s failures, never attempted content as a successful change", name => {
		let def!: ToolDefinition;
		registerCompactBuiltInTool({ registerTool: (value: ToolDefinition) => { def = value; } } as never, name);
		const row = tool(def);
		row.updateArgs({ path: "fixture.txt", content: "first\nUNWRITTEN CONTENT", edits: [{ oldText: "old", newText: "UNAPPLIED EDIT" }] });
		row.updateResult({ content: [{ type: "text", text: "permission denied" }], details: undefined, isError: true });
		for (const expanded of [false, true]) {
			row.setExpanded(expanded);
			expect(lines(row).join("\n")).toContain("permission denied");
			expect(lines(row).join("\n")).not.toMatch(/UNWRITTEN CONTENT|UNAPPLIED EDIT/);
		}
	});

	it("gives extension renderers their own reusable child, never a Tron border wrapper", () => {
		const seen: unknown[] = [];
		const row = tool(createCompactToolDefinition({
			name: "cached", label: "cached", description: "test", parameters: {} as never, execute: vi.fn(),
			renderResult: (_result, _options, _theme, context) => {
				seen.push(context.lastComponent);
				const child = (context.lastComponent ?? new Text("", 0, 0)) as Text;
				child.setText("DETAILS");
				return child;
			},
		}));
		result(row);
		mouse(row, 0);
		expect(expanded(row)).toBe(true);
		lines(row); lines(row);
		expect(seen.some(value => value instanceof Text)).toBe(true);
		expect(seen.every(value => value === undefined || value instanceof Text)).toBe(true);
		mouse(row, 0); mouse(row, 0);
		expect(expanded(row)).toBe(true);
	});

	it("preserves expansion across partial updates, resize and invalidation; keyboard setters still win", () => {
		const row = tool();
		expect(mouse(row, 0)).toBeUndefined(); // No result yet.
		result(row, "partial", true);
		mouse(row, 0);
		expect(expanded(row)).toBe(true);
		result(row, "finished");
		row.invalidate();
		expect(lines(row, 40).join("\n")).toContain("finished");
		row.setExpanded(false);
		expect(expanded(row)).toBe(false);
		row.setExpanded(true);
		expect(expanded(row)).toBe(true);
	});

	it("ignores non-clicks, other buttons and coordinates outside the visible box", () => {
		const row = tool(); result(row);
		for (const type of ["press", "release", "drag", "move", "wheel"] as const) mouse(row, 1, { type });
		mouse(row, 1, { button: "right" });
		for (const y of [-1, lines(row).length, lines(row).length + 1]) expect(mouse(row, y)).toBeUndefined();
		expect(mouse(row, 0, { x: WIDTH })).toBeUndefined();
		expect(mouse(row, 0, { width: WIDTH - 1 })).toBeUndefined();
		expect(mouse(row, 2, { height: 2 })).toBeUndefined();
		expect(expanded(row)).toBe(false);
	});

	it("leaves child controls in charge and forwards correct screen coordinates", () => {
		const childClick = vi.fn(() => ({ handled: true }));
		const row = tool({
			name: "control", label: "control", description: "test", parameters: {} as never, renderShell: "self",
			execute: vi.fn(), renderCall: () => new MouseRegion(new Text("control", 0, 0), childClick),
			renderResult: (_r, options) => new Text(options.expanded ? "DETAILS" : "preview", 0, 0),
		});
		result(row);
		mouse(row, 0, { screenY: 10 });
		expect(childClick).toHaveBeenCalledWith(expect.objectContaining({ y: 0, screenY: 10 }));
		expect(expanded(row)).toBe(false);
	});

	it("does not add a row offset to default-shell tools", () => {
		const row = tool({ name: "default", label: "default", description: "test", parameters: {} as never,
			execute: vi.fn(), renderCall: () => new Text("call", 0, 0),
			renderResult: (_r, options) => new Text(options.expanded ? "DETAILS" : "preview", 0, 0) });
		result(row);
		mouse(row, lines(row).findIndex(line => line.includes("call")));
		expect(expanded(row)).toBe(true);
	});

	it.each(["extensions", "mutations"])("routes fullscreen clicks to only one tool, preserving focus and drags (%s)", kind => {
		let send: (data: string) => void = () => {};
		const terminal: any = { columns: WIDTH, rows: 24, kittyProtocolActive: true,
			start: (fn: typeof send) => { send = fn; }, stop() {}, write() {}, hideCursor() {}, showCursor() {},
			moveBy() {}, clearLine() {}, clearFromCursor() {}, clearScreen() {}, setTitle() {} };
		const tui = new TuiAltScreen(terminal, false, undefined, { copyOnSelect: false });
		const first = tool(kind === "mutations" ? builtInDefinition("write") : definition("first"), tui, "first");
		const second = tool(kind === "mutations" ? builtInDefinition("edit") : definition("second"), tui, "second");
		if (kind === "mutations") {
			first.updateArgs({ path: "fixture.txt", content: "first line\nWRITE DETAILS" });
			second.updateArgs({ path: "fixture.txt", edits: [{ oldText: "old", newText: "EDIT DETAILS" }] });
		}
		result(first); result(second);
		const editor = new Text("editor", 0, 0);
		tui.addChild(new Text("transcript", 0, 0)); tui.addChild(first); tui.addChild(second); tui.addChild(editor);
		tui.setFocus(editor); tui.start();
		try {
			tui.renderNow();
			send("\x1b[<0;3;2M");
			expect(expanded(first)).toBe(false);
			send("\x1b[<0;3;2m");
			expect(expanded(first)).toBe(true);
			expect(expanded(second)).toBe(false);
			expect(tui.getFocusedComponent()).toBe(editor);
			tui.renderNow();
			send("\x1b[<0;3;2M"); send("\x1b[<32;8;2M"); send("\x1b[<0;8;2m");
			expect(expanded(first)).toBe(true);
			tui.renderNow();
			send("\x1b[<0;3;2M"); send("\x1b[<0;3;2m");
			expect(expanded(first)).toBe(false);
			tui.renderNow();
			const secondY = 1 + lines(first).length + 1; // Header plus first tool, then one-based terminal row.
			send(`\x1b[<0;3;${secondY}M`); send(`\x1b[<0;3;${secondY}m`);
			expect(expanded(first)).toBe(false);
			expect(expanded(second)).toBe(true);
		} finally { tui.stop({ preserveScreen: true }); }
	});
});
