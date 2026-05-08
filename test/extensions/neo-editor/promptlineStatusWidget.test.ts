import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { buildPromptlineStatusLine } from "../../../packages/extensions/src/neo-editor/features/promptline/status-widget/buildPromptlineStatusLine.js";
import { createPromptlineStatusWidget } from "../../../packages/extensions/src/neo-editor/features/promptline/status-widget/createPromptlineStatusWidget.js";
import { setPromptlineModelOverride } from "../../../packages/extensions/src/neo-editor/features/promptline/state.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum context required by the promptline status widget.
 *
 * @param entries Active branch entries.
 * @returns Extension context stub.
 */
function createContext(entries: Array<{ type: string; message?: { role: string; content: unknown }; content?: unknown }>) {
	return {
		model: { id: "gpt-5.5" },
		ui: { theme: createTestTheme() },
		sessionManager: { getBranch: () => entries },
	};
}

test.afterEach(() => {
	setPromptlineModelOverride(undefined);
});

test("promptline status widget shows model and thinking without an invented title", () => {
	const widget = createPromptlineStatusWidget(createContext([]) as never, () => "high", () => undefined);
	const [line] = widget.render(120);

	assert.ok(line?.startsWith("                              "));
	assert.match(line ?? "", /gpt-5\.5/);
	assert.match(line ?? "", /high/);
	assert.doesNotMatch(line ?? "", /120×/);
	assert.doesNotMatch(line ?? "", /Untitled session/);
	assert.doesNotMatch(line ?? "", /\(\d+s\)/);
});

test("promptline status widget renders title and duration after conversation messages", () => {
	const widget = createPromptlineStatusWidget(createContext([{ type: "message" }]) as never, () => "high", () => "Locate footer status display code");
	const [line] = widget.render(120);

	assert.equal(line?.startsWith(" "), false);
	assert.match(line ?? "", /Locate footer status display code/);
	assert.doesNotMatch(line ?? "", /120×/);
	assert.match(line ?? "", /\[ ⏱ \d+s\]$/);
	assert.match(line ?? "", /gpt-5\.5/);
});

test("promptline status widget falls back to latest user prompt while release sessions are unnamed", () => {
	const widget = createPromptlineStatusWidget(
		createContext([{ type: "message", message: { role: "user", content: "Greet the user" } }]) as never,
		() => "high",
		() => undefined,
	);
	const [line] = widget.render(120);

	assert.equal(line?.startsWith(" "), false);
	assert.match(line ?? "", /Greet the user/);
	assert.match(line ?? "", /\[ ⏱ \d+s\]$/);
	assert.match(line ?? "", /gpt-5\.5/);
});

test("promptline status widget uses the live model override", () => {
	const widget = createPromptlineStatusWidget(createContext([]) as never, () => "high", () => undefined);
	setPromptlineModelOverride({ id: "MiniMax-M2.7", provider: "minimax", reasoning: true } as never);
	const [line] = widget.render(120);

	assert.match(line ?? "", /MiniMax-M2\.7/);
	assert.doesNotMatch(line ?? "", /gpt-5\.5/);
});

test("promptline status line stays within its frame width", () => {
	const line = buildPromptlineStatusLine("model high", "[ ⏱ 3s]", "A very long session title", 18, createTestTheme());

	assert.ok(visibleWidth(line) <= 18);
});

test("promptline status line right-aligns runtime after the session title", () => {
	const line = buildPromptlineStatusLine("gpt-5.5  medium", "[ ⏱ 10m8s]", "Find neo prompt dimension display code", 80, createTestTheme());

	assert.equal(visibleWidth(line), 80);
	assert.ok(line.startsWith("gpt-5.5  medium Find neo prompt dimension display code"));
	assert.ok(line.endsWith("[ ⏱ 10m8s]"));
});
