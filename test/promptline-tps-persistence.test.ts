import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { stripTerminalSequences } from "@earendil-works/pi-tui";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	beginTpsStreaming, endTpsStreaming, getAverageTps, getPromptlineTpsLabel, recordTpsDelta,
	resetTpsTracker, setPromptlineRefreshRequest,
} from "../packages/extension-core/neo-editor/src/features/promptline/status-widget/promptlineTpsTracker";
import { registerPromptlineStatusWidget } from "../packages/extension-core/neo-editor/src/features/promptline/status-widget/registerPromptlineStatusWidget";

const label = () => stripTerminalSequences(getPromptlineTpsLabel());
const idle = "— \uf0e7 —";
beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(10_000);
	resetTpsTracker();
});
afterEach(() => {
	setPromptlineRefreshRequest(null);
	resetTpsTracker();
	vi.useRealTimers();
});
function sample() {
	recordTpsDelta(20);
	vi.advanceTimersByTime(200);
	recordTpsDelta(20);
	expect(label()).toBe("200 \uf0e7 200");
}

describe("TPS reading persistence", () => {
	it("shows only TPS values through idle, streaming, and held states", () => {
		expect(label()).toBe(`${idle}`);
		recordTpsDelta(20);
		expect(label()).toBe(`${idle}`);
		vi.advanceTimersByTime(200);
		recordTpsDelta(20);
		expect(label()).toBe("200 \uf0e7 200");
		vi.advanceTimersByTime(1000);
		expect(label()).toBe("200 \uf0e7 200");
		endTpsStreaming();
		beginTpsStreaming();
		recordTpsDelta(10);
		expect(label()).toBe("200 \uf0e7 200");
		vi.advanceTimersByTime(200);
		recordTpsDelta(10);
		expect(label()).toBe("100 \uf0e7 150");
		endTpsStreaming();
		expect(label()).toBe("100 \uf0e7 150");
		resetTpsTracker();
		expect(label()).toBe(`${idle}`);
	});

	it("starts with dashes, then retains readings during silence and delayed stream end", () => {
		expect(label()).toBe(idle);
		sample();
		vi.advanceTimersByTime(30_000);
		expect(label()).toBe("200 \uf0e7 200");
		endTpsStreaming();
		vi.advanceTimersByTime(30_000);
		expect(label()).toBe("200 \uf0e7 200");
	});

	it("captures the final delta even when no repaint occurs before message_end", () => {
		recordTpsDelta(20);
		vi.advanceTimersByTime(200);
		recordTpsDelta(20);
		vi.advanceTimersByTime(5_000);
		endTpsStreaming();
		expect(label()).toBe("200 \uf0e7 200");
	});

	it("retains readings through empty messages and replaces them with a fresh measurement", () => {
		sample();
		endTpsStreaming();
		beginTpsStreaming();
		vi.advanceTimersByTime(5_000);
		endTpsStreaming();
		expect(label()).toBe("200 \uf0e7 200");
		beginTpsStreaming();
		recordTpsDelta(4);
		expect(label()).toBe("200 \uf0e7 200");
		vi.advanceTimersByTime(200);
		recordTpsDelta(6);
		expect(label()).toBe("50 \uf0e7 125");
	});

	it("adds each recorded live reading to the session average", () => {
		sample();
		endTpsStreaming();
		beginTpsStreaming();
		recordTpsDelta(1);
		vi.advanceTimersByTime(10);
		recordTpsDelta(1);
		expect(label()).toBe("20 \uf0e7 110");
		endTpsStreaming();
		expect(label()).toBe("20 \uf0e7 110");
	});

	it("averages all session readings beyond 1000 samples without evicting history", () => {
		for (let rate = 1; rate <= 2100; rate++) {
			beginTpsStreaming();
			recordTpsDelta(rate / 10);
			vi.advanceTimersByTime(200);
			recordTpsDelta(rate / 10);
			expect(getAverageTps()).toBe((rate + 1) / 2);
			endTpsStreaming();
		}
		expect(label()).toBe("2100 \uf0e7 1051");
		for (let i = 0; i < 100; i++) label();
		vi.advanceTimersByTime(60_000);
		expect(getAverageTps()).toBe(1050.5);
	});

	it("only clears retained readings on a full session reset", () => {
		sample();
		resetTpsTracker();
		expect(label()).toBe(idle);
		expect(getAverageTps()).toBe(0);
		recordTpsDelta(5);
		vi.advanceTimersByTime(200);
		recordTpsDelta(5);
		expect(getAverageTps()).toBe(50);
	});
});

function harness() {
	const handlers = new Map<string, (event: any, ctx: ExtensionContext) => unknown>();
	let widget: { render(width: number): string[] };
	const tui = { terminal: { rows: 24, columns: 180 }, requestRender: vi.fn() };
	const ctx = {
		hasUI: true,
		model: { id: "model", provider: "provider" },
		ui: {
			setWidget: (_key: string, factory: (tui: unknown) => typeof widget) => { widget = factory(tui); },
			getEditorText: () => "", theme: { fg: (_color: string, text: string) => text },
		},
		sessionManager: { getSessionId: () => "test-session", getBranch: () => [{ type: "message" }] },
	} as unknown as ExtensionContext;
	const pi = {
		on: (name: string, handler: (event: any, ctx: ExtensionContext) => unknown) => handlers.set(name, handler),
		events: { on: () => () => {}, emit: () => {} },
		getThinkingLevel: () => "high", getSessionName: () => "Test session",
	} as unknown as ExtensionAPI;
	registerPromptlineStatusWidget(pi);
	return {
		emit: async (name: string, event: unknown = {}) => handlers.get(name)?.(event, ctx),
		row: () => widget.render(180).map(stripTerminalSequences).join("\n"),
	};
}

describe("real Neo TPS event wiring and metadata row", () => {
	it.each(["text_delta", "thinking_delta", "toolcall_delta"])("holds %s readings across tool waits and the next assistant message", async type => {
		const ui = harness();
		await ui.emit("session_start");
		expect(ui.row()).toContain(idle);
		const assistant = { message: { role: "assistant" } };
		const delta = { assistantMessageEvent: { type, delta: "x".repeat(80) } };
		await ui.emit("message_start", assistant);
		await ui.emit("message_update", delta);
		vi.advanceTimersByTime(200);
		await ui.emit("message_update", delta);
		vi.advanceTimersByTime(300); // Real refresh callback redraws at 500 ms.
		expect(ui.row()).toContain("200 \uf0e7 200");
		vi.advanceTimersByTime(5_000);
		await ui.emit("message_end", assistant);
		expect(ui.row()).toContain("200 \uf0e7 200");
		expect(vi.getTimerCount()).toBe(0);
		await ui.emit("message_start", { message: { role: "toolResult" } });
		vi.advanceTimersByTime(20_000);
		await ui.emit("message_end", { message: { role: "toolResult" } });
		await ui.emit("turn_end");
		expect(ui.row()).toContain("200 \uf0e7 200");
		await ui.emit("message_start", assistant);
		expect(ui.row()).toContain("200 \uf0e7 200");
		await ui.emit("message_update", { assistantMessageEvent: { type, delta: "x".repeat(40) } });
		expect(ui.row()).toContain("200 \uf0e7 200");
		vi.advanceTimersByTime(200);
		await ui.emit("message_update", { assistantMessageEvent: { type, delta: "x".repeat(40) } });
		await ui.emit("message_end", assistant);
		expect(ui.row()).toContain("100 \uf0e7 150");
		await ui.emit("session_shutdown");
		expect(vi.getTimerCount()).toBe(0);
		await ui.emit("session_start");
		expect(ui.row()).toContain(idle);
		await ui.emit("session_shutdown");
	});
});
