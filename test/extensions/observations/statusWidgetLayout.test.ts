import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { buildObservationsStatusLine } from "../../../packages/extensions/src/observations/status-widget/buildObservationsStatusLine.js";
import { createObservationsStatusWidget } from "../../../packages/extensions/src/observations/status-widget/createObservationsStatusWidget.js";
import { setPromptlineModelOverride } from "../../../packages/extensions/src/neo-editor/features/promptline/state.js";
import { getVisibleSessionName } from "../../../packages/extensions/src/observations/status-widget/getVisibleSessionName.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum context required by the observations status widget.
 *
 * @param entries Active branch entries.
 * @returns Extension context stub.
 */
function createContext(entries: Array<{ type: string }>) {
	return {
		model: { id: "gpt-5.5" },
		ui: { theme: createTestTheme() },
		sessionManager: { getBranch: () => entries },
	};
}

test.afterEach(() => {
	setPromptlineModelOverride(undefined);
});

test("observations status widget aligns below compact empty promptline", () => {
	const widget = createObservationsStatusWidget(createContext([]) as never, () => "high", () => undefined);
	const [line] = widget.render(120);

	assert.ok(line?.startsWith("                              "));
	assert.match(line ?? "", /gpt-5\.5/);
	assert.match(line ?? "", /high/);
	assert.doesNotMatch(line ?? "", /Untitled session/);
	assert.doesNotMatch(line ?? "", /\(\d+s\)/);
});

test("observations status widget uses the live model override", () => {
	const widget = createObservationsStatusWidget(createContext([]) as never, () => "high", () => undefined);
	setPromptlineModelOverride({ id: "MiniMax-M2.7", provider: "minimax", reasoning: true } as never);
	const [line] = widget.render(120);

	assert.match(line ?? "", /MiniMax-M2\.7/);
	assert.doesNotMatch(line ?? "", /gpt-5\.5/);
});

test("observations status widget uses full width after conversation messages", () => {
	const widget = createObservationsStatusWidget(createContext([{ type: "message" }]) as never, () => "high", () => "Roadmap");
	const [line] = widget.render(120);

	assert.equal(line?.startsWith(" "), false);
	assert.match(line ?? "", /Roadmap/);
	assert.match(line ?? "", /\(\d+s\)/);
	assert.match(line ?? "", /gpt-5\.5/);
});

test("visible session name does not invent an Untitled placeholder", () => {
	assert.equal(getVisibleSessionName(() => undefined), undefined);
	assert.equal(getVisibleSessionName(() => "  "), undefined);
	assert.equal(getVisibleSessionName(() => "Plan"), "Plan");
});

test("observations status line stays within its frame width", () => {
	const line = buildObservationsStatusLine("model high", "(3s)", "A very long session title", 18, createTestTheme());

	assert.ok(visibleWidth(line) <= 18);
});
