import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Container, Text, TuiAltScreen, stripTerminalSequences, visibleWidth, type Component, type TuiMouseEvent } from "@earendil-works/pi-tui";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPromptlineStatusWidget } from "../packages/extension-core/neo-editor/src/features/promptline/status-widget/createPromptlineStatusWidget";
import { renderPromptlineStatusWidget } from "../packages/extension-core/neo-editor/src/features/promptline/status-widget/renderPromptlineStatusWidget";
import { setBelowEditorSlot } from "../packages/extension-core/subagent-tintin/src/ui/below-editor-layout";
import { resetTpsTracker } from "../packages/extension-core/neo-editor/src/features/promptline/status-widget/promptlineTpsTracker";
import { setPromptlineModelOverride, setPromptlineProviderPickerOpener } from "../packages/extension-core/neo-editor/src/features/promptline/state";
import { PromptlineEditor } from "../packages/extension-core/neo-editor/src/features/promptline/PromptlineEditor";
import { createSlashModal } from "../packages/extension-core/neo-editor/src/features/promptline/trigger/createSlashModal";

// Existing picker is an action boundary: never read/write provider configuration.
vi.mock("../packages/extension-core/neo-editor/src/features/promptline/trigger/createSlashModal", () => ({ createSlashModal: vi.fn() }));
const identity = (text: string) => text;
const theme = { fg: (_: string, text: string) => text };
function context(hasMessages = true): ExtensionContext {
	return {
		hasUI: true, cwd: "/tmp", model: { id: "test-model", provider: "gateway界" },
		ui: { theme, notify: vi.fn() },
		sessionManager: { getSessionId: () => "test", getBranch: () => hasMessages ? [{ type: "message" }] : [] },
	} as unknown as ExtensionContext;
}
function mouse(x: number, width = 180, overrides: Partial<TuiMouseEvent> = {}): TuiMouseEvent {
	return { type: "click", button: "left", x, y: 0, screenX: x, screenY: 0, width, height: 1, shift: false, alt: false, ctrl: false, ...overrides };
}
beforeEach(() => {
	resetTpsTracker();
	setPromptlineModelOverride(undefined);
	vi.clearAllMocks();
});
afterEach(() => { setPromptlineProviderPickerOpener(undefined); });

describe("provider badge hit region", () => {
	it.each([true, false])("hits only the provider in the actual row (conversation=%s)", hasMessages => {
		const clicked = vi.fn();
		const row = createPromptlineStatusWidget(context(hasMessages), () => "high", () => "Session", () => "", clicked);
		const text = stripTerminalSequences(row.render(180)[0]);
		const start = visibleWidth(text.slice(0, text.indexOf("gateway界")));
		expect(row.handleMouse?.(mouse(start))).toEqual({ handled: true });
		expect(clicked).toHaveBeenCalledTimes(1);
		const modelCol = visibleWidth(text.slice(0, text.indexOf("test-model")));
		expect(row.handleMouse?.(mouse(modelCol))).toBeUndefined();
		expect(row.handleMouse?.(mouse(179))).toBeUndefined();
		if (!hasMessages) expect(row.handleMouse?.(mouse(0))).toBeUndefined();
		for (const type of ["press", "release", "drag", "move", "wheel"] as const) {
			expect(row.handleMouse?.(mouse(start, 180, { type }))).toBeUndefined();
		}
		expect(row.handleMouse?.(mouse(start, 180, { button: "right" }))).toBeUndefined();
		expect(row.handleMouse?.(mouse(start, 180, { y: 1 }))).toBeUndefined();
		expect(clicked).toHaveBeenCalledTimes(1);
		row.render(180); // Cached render retains exactly the same hit region.
		row.handleMouse?.(mouse(start));
		expect(clicked).toHaveBeenCalledTimes(2);
	});

	it("does not hit a clipped-away provider or TPS in a narrow row", () => {
		const clicked = vi.fn();
		const row = createPromptlineStatusWidget(context(false), () => "high", () => "Session", () => "", clicked);
		row.render(5);
		for (let x = 0; x < 5; x++) expect(row.handleMouse?.(mouse(x, 5))).toBeUndefined();
		row.render(10); // Only the first four cells of the provider fit before TPS.
		row.handleMouse?.(mouse(1, 10));
		expect(clicked).toHaveBeenCalledTimes(1);
		expect(row.handleMouse?.(mouse(9, 10))).toBeUndefined();
		expect(row.handleMouse?.(mouse(1, 180))).toBeUndefined();
		row.invalidate();
		expect(row.handleMouse?.(mouse(1, 10))).toBeUndefined();
	});
});

function screen() {
	let input: (data: string) => void = () => {};
	const terminal: any = {
		columns: 180, rows: 24, kittyProtocolActive: true,
		start: (fn: typeof input) => { input = fn; }, stop() {}, write() {}, hideCursor() {}, showCursor() {},
		moveBy() {}, clearLine() {}, clearFromCursor() {}, clearScreen() {}, setTitle() {},
	};
	const tui = new TuiAltScreen(terminal);
	const below = new Container();
	tui.addChild(new Text("editor", 0, 0));
	tui.addChild(below);
	const ui: any = {
		theme, getEditorText: () => "draft stays here",
		setWidget: (_key: string, factory: (tui: TuiAltScreen, theme: typeof theme) => Component) => {
			below.clear(); below.addChild(factory(tui, theme));
		},
	};
	return { tui, below, ui, input: (data: string) => input(data) };
}

describe("bottom-row mouse routing", () => {
	it("routes real fullscreen press/release into the provider action, not fleet rows", () => {
		const app = screen();
		const clicked = vi.fn();
		setPromptlineProviderPickerOpener(clicked);
		const ctx = context();
		Object.assign(ctx.ui, app.ui);
		renderPromptlineStatusWidget(ctx, () => "high", () => "Session");
		setBelowEditorSlot(app.ui, "fleet", () => new Text("fleet", 0, 0));
		app.tui.start();
		try {
			app.tui.renderNow();
			const lines = (app.tui as unknown as { previousScreen: string[] }).previousScreen.map(stripTerminalSequences);
			const y = lines.findIndex(line => line.includes("gateway界"));
			expect(y).toBeGreaterThanOrEqual(0);
			const x = visibleWidth(lines[y].slice(0, lines[y].indexOf("gateway界")));
			app.input(`\x1b[<0;${x + 1};${y + 1}M`);
			expect(clicked).not.toHaveBeenCalled();
			app.input(`\x1b[<0;${x + 1};${y + 1}m`);
			expect(clicked).toHaveBeenCalledTimes(1);
			const fleetY = lines.findIndex(line => line.includes("fleet"));
			app.input(`\x1b[<0;${x + 1};${fleetY + 1}M`);
			app.input(`\x1b[<0;${x + 1};${fleetY + 1}m`);
			expect(clicked).toHaveBeenCalledTimes(1);
		} finally { app.tui.stop({ preserveScreen: true }); }
	});

	it("translates child rows and ignores rows clipped out of the host", () => {
		const app = screen();
		const hit = vi.fn(() => ({ handled: true }));
		setBelowEditorSlot(app.ui, "metadata", () => new Text("metadata", 0, 0));
		setBelowEditorSlot(app.ui, "fleet", () => ({ render: () => ["fleet 1", "fleet 2"], invalidate() {}, handleMouse: hit }));
		const widget = app.below.children[0];
		widget.render(180);
		widget.handleMouse?.(mouse(1, 180, { y: 2, screenY: 12, height: 3 }));
		expect(hit).toHaveBeenCalledWith(expect.objectContaining({ y: 1, screenY: 12, height: 2 }));
		hit.mockClear();
		expect(widget.handleMouse?.(mouse(1, 180, { y: 2, height: 2 }))).toBeUndefined();
		expect(hit).not.toHaveBeenCalled();
	});
});

describe("existing provider picker action", () => {
	it("opens Providers directly and cancellation preserves the draft and focus", async () => {
		const app = screen();
		const ctx = context();
		const editorTheme: any = { borderColor: identity, selectList: { selectedPrefix: identity, selectedText: identity, description: identity, scrollInfo: identity, noMatch: identity } };
		const editor = new PromptlineEditor(app.tui as never, editorTheme, {} as never, ctx, theme as never,
			() => "high", vi.fn(), () => "Session", () => ({ triggerConfig: { rules: [] }, neoConfig: {} }) as never,
			async () => ({}) as never);
		editor.setText("draft stays here");
		editor.onSubmit = vi.fn();
		app.tui.setFocus(editor);
		const openLevel = vi.fn(async () => {});
		vi.mocked(createSlashModal).mockImplementation((_ctx, close, _render, _setText, _thinking, _setThinking, _submit, showOverlay) => {
			const modal = { render: () => ["Providers"], invalidate() {}, handleInput: (key: string) => { if (key === "\x1b") close(); }, openLevel };
			return { modal, handle: showOverlay(modal) } as never;
		});
		editor.openProviderPicker();
		expect(openLevel).toHaveBeenCalledWith("login-picker");
		expect(editor.getText()).toBe("draft stays here");
		expect(editor.onSubmit).not.toHaveBeenCalled();
		expect(app.tui.getFocusedComponent()).not.toBe(editor);
		editor.openProviderPicker(); // An existing overlay prevents duplicates/click-through.
		expect(createSlashModal).toHaveBeenCalledTimes(1);
		app.tui.getFocusedComponent()?.handleInput?.("\x1b");
		expect(app.tui.getFocusedComponent()).toBe(editor);
		expect(editor.getText()).toBe("draft stays here");
	});
});
