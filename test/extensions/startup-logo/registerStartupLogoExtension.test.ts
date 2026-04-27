import assert from "node:assert/strict";
import test from "node:test";
import { registerStartupLogoExtension } from "../../../src/extensions/startup-logo/registerStartupLogoExtension.js";
import { startupLogoWidgetKey } from "../../../src/extensions/startup-logo/startupLogoWidgetKey.js";

interface WidgetCall {
	key: string;
	value: unknown;
	placement: string | undefined;
}

interface TestUi {
	setWidget(key: string, value: unknown, options?: { placement?: string }): void;
	theme?: { fg(name: string, value: string): string };
}

/**
 * Captures startup-logo handlers and widget calls for extension tests.
 *
 * @returns Registered handlers and collected UI calls.
 */
function createStartupLogoHarness(): {
	sessionStartHandler: ((event: { reason: string }, ctx: { hasUI: boolean; ui: TestUi }) => void) | undefined;
	turnStartHandler: ((event: unknown, ctx: { hasUI: boolean; ui: TestUi }) => void) | undefined;
	sessionShutdownHandler: ((event: unknown, ctx: { hasUI: boolean; ui: TestUi }) => void) | undefined;
	ctx: { hasUI: boolean; ui: TestUi };
	calls: WidgetCall[];
} {
	let sessionStartHandler:
		| ((event: { reason: string }, ctx: { hasUI: boolean; ui: TestUi }) => void)
		| undefined;
	let turnStartHandler:
		| ((event: unknown, ctx: { hasUI: boolean; ui: TestUi }) => void)
		| undefined;
	let sessionShutdownHandler:
		| ((event: unknown, ctx: { hasUI: boolean; ui: TestUi }) => void)
		| undefined;
	const calls: WidgetCall[] = [];
	const pi = {
		on(eventName: string, handler: unknown) {
			if (eventName === "session_start") sessionStartHandler = handler as typeof sessionStartHandler;
			if (eventName === "turn_start") turnStartHandler = handler as typeof turnStartHandler;
			if (eventName === "session_shutdown") sessionShutdownHandler = handler as typeof sessionShutdownHandler;
		},
	};
	const ctx = {
		hasUI: true,
		ui: {
			setWidget(key: string, value: unknown, options?: { placement?: string }) {
				calls.push({ key, value, placement: options?.placement });
			},
			theme: {
				fg(_name: string, value: string) {
					return value;
				},
			},
		},
	};

	registerStartupLogoExtension(pi as never);
	return { sessionStartHandler, turnStartHandler, sessionShutdownHandler, ctx, calls };
}

test("startup logo shows above the editor on fresh startup and clears on the first turn", () => {
	const originalArgv = process.argv;
	process.argv = ["node", "nexus"];

	try {
		const { sessionStartHandler, turnStartHandler, ctx, calls } = createStartupLogoHarness();
		sessionStartHandler?.({ reason: "startup" }, ctx);
		turnStartHandler?.({}, ctx);

		const widgetFactory = calls[0]?.value as (
			tui: { terminal: { rows: number } },
			theme: { fg(name: string, value: string): string },
		) => { render(width: number): string[] };
		const widget = widgetFactory({ terminal: { rows: 30 } }, ctx.ui.theme!);

		assert.equal(calls[0]?.key, startupLogoWidgetKey);
		assert.equal(calls[0]?.placement, "aboveEditor");
		assert.ok(widget.render(80).some((line) => line.includes("_   _  _____ __  __ _   _  ____")));
		assert.deepEqual(calls[1], { key: startupLogoWidgetKey, value: undefined, placement: "aboveEditor" });
	} finally {
		process.argv = originalArgv;
	}
});

test("startup logo stays hidden when startup enters resume selection", () => {
	const originalArgv = process.argv;
	process.argv = ["node", "nexus", "--resume"];

	try {
		const { sessionStartHandler, ctx, calls } = createStartupLogoHarness();
		sessionStartHandler?.({ reason: "startup" }, ctx);

		assert.deepEqual(calls, [{ key: startupLogoWidgetKey, value: undefined, placement: "aboveEditor" }]);
	} finally {
		process.argv = originalArgv;
	}
});

test("startup logo stays hidden on resumed sessions and clears on shutdown", () => {
	const originalArgv = process.argv;
	process.argv = ["node", "nexus"];

	try {
		const { sessionStartHandler, sessionShutdownHandler, ctx, calls } = createStartupLogoHarness();
		sessionStartHandler?.({ reason: "resume" }, ctx);
		sessionShutdownHandler?.({}, ctx);

		assert.deepEqual(calls, [
			{ key: startupLogoWidgetKey, value: undefined, placement: "aboveEditor" },
			{ key: startupLogoWidgetKey, value: undefined, placement: "aboveEditor" },
		]);
	} finally {
		process.argv = originalArgv;
	}
});
