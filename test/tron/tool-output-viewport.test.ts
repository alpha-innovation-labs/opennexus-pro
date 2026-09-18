import { ToolExecutionComponent, type ToolDefinition } from "@earendil-works/pi-coding-agent";
import { MouseRegion, Text, TuiAltScreen, stripTerminalSequences, visibleWidth, type TUI, type TuiMouseEvent } from "@earendil-works/pi-tui";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ToolOutputViewport, getToolOutputScrollState } from "../../packages/extension-core/tron/src/compact-tool-lines/ToolOutputViewport";
import { createCompactToolDefinition } from "../../packages/extension-core/tron/src/compact-tool-lines/createCompactToolDefinition";
import { applyToolExecutionSpacingPatch } from "../../packages/pi-platform/src/applyToolExecutionSpacingPatch";
import { resetAssistantActivityGrouping } from "../../packages/extension-core/tron/src/activity/resetAssistantActivityGrouping";

const id = (s: string) => s;
const themeKey = Symbol.for("@earendil-works/pi-coding-agent:theme");
let previousTheme: unknown;
beforeEach(() => {
	previousTheme = (globalThis as any)[themeKey];
	(globalThis as any)[themeKey] = { fg: (_: string, s: string) => s, bg: (_: string, s: string) => s, bold: id, italic: id, inverse: id };
	resetAssistantActivityGrouping();
});
afterEach(() => { (globalThis as any)[themeKey] = previousTheme; resetAssistantActivityGrouping(); });
applyToolExecutionSpacingPatch();
const output = (count = 100) => Array.from({ length: count }, (_, i) => `line-${i.toString().padStart(3, "0")}`).join("\n");
function event(overrides: Partial<TuiMouseEvent> = {}): TuiMouseEvent {
	return { type: "wheel", button: "none", x: 2, y: 1, screenX: 2, screenY: 1, width: 40, height: 20,
		shift: false, alt: false, ctrl: false, wheelDelta: 3, ...overrides };
}
function fixture(ui: Pick<TUI, "requestRender"> & { mode?: string } = { requestRender() {}, mode: "fullscreen" }, name = "fixture", args = {}) {
	const definition = createCompactToolDefinition({ name, label: name, description: "fixture", parameters: {} as never,
		execute: vi.fn(), renderResult: (result) => new Text(result.content.filter(c => c.type === "text").map(c => c.text).join("\n"), 0, 0) } as ToolDefinition);
	const row = new ToolExecutionComponent(name, name, args, {}, definition, ui as TUI, "/tmp");
	row.updateResult({ content: [{ type: "text", text: output() }], details: undefined, isError: false });
	row.setExpanded(true);
	return row;
}
function lines(row: ToolExecutionComponent, width = 40) { return row.render(width).map(stripTerminalSequences); }

it("caps output at 20 rows, shows a thumb only on overflow, and chains wheel at both ends", () => {
	const state = { top: 0 }, child = new Text(output(), 0, 0);
	const viewport = new ToolOutputViewport(child, state, id);
	let rendered = viewport.render(40);
	expect(rendered).toHaveLength(20);
	expect(rendered[0]).toContain("line-000"); expect(rendered[0].endsWith("█")).toBe(true);
	expect(viewport.handleMouse(event({ wheelDelta: -3 }))).toBeUndefined();
	expect(viewport.handleMouse(event())).toMatchObject({ handled: true });
	expect(viewport.render(40)[0]).toContain("line-003");
	viewport.handleMouse(event({ wheelDelta: 999 }));
	expect(viewport.render(40).at(-1)).toContain("line-099");
	expect(viewport.handleMouse(event())).toBeUndefined();
	child.setText("short"); viewport.invalidate();
	rendered = viewport.render(40);
	expect(rendered.map(line => line.trimEnd())).toEqual(["short"]); expect(state.top).toBe(0);
});

it("supports track clicks and thumb dragging without focusing or collapsing", () => {
	const state = { top: 0 };
	const viewport = new ToolOutputViewport(new Text(output(), 0, 0), state, id);
	viewport.render(40);
	expect(viewport.handleMouse(event({ type: "press", button: "left", x: 39, y: 0 }))).toEqual({ handled: true, capture: true, render: true });
	viewport.handleMouse(event({ type: "drag", button: "left", x: 50, y: 80 }));
	expect(state.top).toBe(80);
	viewport.handleMouse(event({ type: "release", button: "left", x: 50, y: 80 }));
	viewport.handleMouse(event({ type: "press", button: "left", x: 39, y: 0 }));
	expect(state.top).toBe(0);
	viewport.handleMouse(event({ type: "release", button: "left" }));
	expect(viewport.handleMouse(event({ type: "click", button: "left", x: 39 }))).toMatchObject({ handled: true });
	expect(viewport.handleMouse(event({ type: "click", button: "left" }))).toBeUndefined(); // Parent owns collapse.
	for (const type of ["press", "drag", "release"] as const) expect(viewport.handleMouse(event({ type, button: "left" }))).toBeUndefined();
});

it("rebases scrolled child controls, including their absolute coordinates", () => {
	const hit = vi.fn((e: TuiMouseEvent) => e.type === "click" ? { handled: true } : undefined);
	const viewport = new ToolOutputViewport(new MouseRegion(new Text(output(), 0, 0), hit), { top: 10 }, id);
	viewport.render(40);
	viewport.handleMouse(event({ type: "click", button: "left", y: 4, screenY: 24 }));
	expect(hit).toHaveBeenCalledWith(expect.objectContaining({ y: 14, screenY: 24, width: 39, height: 100 }));
});

it("clamps after resizing, fits Unicode content, and stores offsets per owner", () => {
	const owner = {}, state = getToolOutputScrollState(owner);
	const viewport = new ToolOutputViewport(new Text("界".repeat(1200), 0, 0), state, id);
	viewport.render(10); viewport.handleMouse(event({ width: 10, wheelDelta: 9999 }));
	const rendered = viewport.render(40);
	expect(rendered).toHaveLength(20);
	expect(rendered.every(line => visibleWidth(line) <= 40)).toBe(true);
	expect(getToolOutputScrollState(owner)).toBe(state);
	expect(getToolOutputScrollState({})).not.toBe(state);
});

it.each(["fixture", "Agent", "SubagentWorkflow", "write", "edit"])("caps %s output and keeps offset through rebuild, resize and collapse", name => {
	const args = name === "write" ? { path: "fixture.txt", content: output() }
		: name === "edit" ? { path: "fixture.txt", edits: [{ oldText: "old", newText: output() }] } : {};
	const row = fixture(undefined, name, args);
	let rendered = lines(row);
	expect(rendered.length).toBeLessThanOrEqual(24); // Header and bottom border are outside the 20 output rows.
	const y = rendered.findIndex((line, index) => index >= 2 && line.includes("line-000"));
	expect(y).toBeGreaterThanOrEqual(0);
	expect(row.handleMouse(event({ y, height: rendered.length }))).toMatchObject({ handled: true });
	expect(lines(row).slice(2).join("\n")).not.toContain("line-000");
	row.invalidate();
	expect(lines(row, 60).slice(2).join("\n")).not.toContain("line-000");
	row.setExpanded(false); row.setExpanded(true);
	expect(lines(row).slice(2).join("\n")).not.toContain("line-000");
	row.updateResult({ content: [{ type: "text", text: output(120) }], details: undefined, isError: false }, true);
	expect(lines(row).slice(2).join("\n")).not.toContain("line-000");
});

it("leaves main-screen output uncapped", () => {
	const row = fixture({ requestRender() {}, mode: "normal" });
	expect(lines(row).length).toBeGreaterThan(100);
	expect(lines(row).join("\n")).toContain("line-099");
});

it("scrolls and drags inside a real fullscreen tool while its header remains clickable", () => {
	let send: (s: string) => void = () => {};
	const terminal: any = { columns: 40, rows: 45, kittyProtocolActive: true,
		start: (fn: typeof send) => { send = fn; }, stop() {}, write() {}, hideCursor() {}, showCursor() {},
		moveBy() {}, clearLine() {}, clearFromCursor() {}, clearScreen() {}, setTitle() {} };
	const tui = new TuiAltScreen(terminal, false, undefined, { copyOnSelect: false });
	const row = fixture(tui), editor = new Text("editor", 0, 0);
	tui.addChild(row); tui.addChild(editor); tui.setFocus(editor); tui.start();
	const press = (x: number, y: number) => send(`\x1b[<0;${x};${y}M`);
	const release = (x: number, y: number) => send(`\x1b[<0;${x};${y}m`);
	try {
		tui.renderNow();
		const bodyY = lines(row).findIndex(line => line.includes("line-000")) + 1;
		send(`\x1b[<65;4;${bodyY}M`); tui.renderNow();
		expect(lines(row).join("\n")).not.toContain("line-000");
		press(4, bodyY); release(4, bodyY); tui.renderNow();
		expect(lines(row).join("\n")).not.toContain("line-");
		press(3, 1); release(3, 1); tui.renderNow();
		expect(lines(row)).toHaveLength(23);
		press(39, bodyY); send(`\x1b[<32;39;${bodyY + 19}M`); release(39, bodyY + 19); tui.renderNow();
		expect(lines(row).join("\n")).toContain("line-099");
		expect(tui.getFocusedComponent()).toBe(editor);
		press(4, bodyY); send(`\x1b[<32;8;${bodyY}M`); release(8, bodyY); tui.renderNow();
		expect(lines(row)).toHaveLength(23);
		expect(tui.hasActiveSelection()).toBe(true);
		press(3, 1); release(3, 1); tui.renderNow();
		expect(lines(row).join("\n")).not.toContain("line-");
	} finally { tui.stop({ preserveScreen: true }); }
});
