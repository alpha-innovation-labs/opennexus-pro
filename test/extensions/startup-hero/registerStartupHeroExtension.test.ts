import assert from "node:assert/strict";
import test from "node:test";
import { registerStartupHeroExtension } from "../../../packages/extensions/src/startup-hero/registerStartupHeroExtension.js";
import { startupHeroWidgetKey } from "../../../packages/extensions/src/startup-hero/startupHeroWidgetKey.js";
import { resumeLaunchEnvVar } from "../../../packages/nexus-runtime/src/cli/normalizeResumeStartupArgs.js";

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
 * Captures startup-hero handlers and widget calls for extension tests.
 *
 * @returns Registered handlers and collected UI calls.
 */
function createStartupHeroHarness(): {
	sessionStartHandler: ((event: { reason: string }, ctx: { hasUI: boolean; ui: TestUi }) => void) | undefined;
	turnStartHandler: ((event: unknown, ctx: { hasUI: boolean; ui: TestUi }) => void) | undefined;
	sessionShutdownHandler: ((event: unknown, ctx: { hasUI: boolean; ui: TestUi }) => void) | undefined;
	ctx: { hasUI: boolean; ui: TestUi; getSystemPrompt(): string };
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
		getSystemPrompt() {
			return [
				"## /repo/AGENTS.md",
				"<available_skills>",
				"  <skill>",
				"    <name>nexus</name>",
				"  </skill>",
				"  <skill>",
				"    <name>software-engineering</name>",
				"  </skill>",
				"</available_skills>",
			].join("\n");
		},
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

	registerStartupHeroExtension(pi as never);
	return { sessionStartHandler, turnStartHandler, sessionShutdownHandler, ctx, calls };
}

test("startup hero shows above the editor on fresh startup and clears on the first turn", () => {
	const originalArgv = process.argv;
	process.argv = ["node", "nexus"];

	try {
		const { sessionStartHandler, turnStartHandler, ctx, calls } = createStartupHeroHarness();
		sessionStartHandler?.({ reason: "startup" }, ctx);
		turnStartHandler?.({}, ctx);

		const widgetFactory = calls[0]?.value as (
			tui: { terminal: { rows: number } },
			theme: { fg(name: string, value: string): string },
		) => { render(width: number): string[] };
		const widget = widgetFactory({ terminal: { rows: 30 } }, ctx.ui.theme!);

		assert.equal(calls[0]?.key, startupHeroWidgetKey);
		assert.equal(calls[0]?.placement, "aboveEditor");
		const rendered = widget.render(80).join("\n");
		assert.match(rendered, /███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗/u);
		assert.match(rendered, /v\d+\.\d+\.\d+/u);
		assert.doesNotMatch(rendered, /Nexus v/u);
		assert.doesNotMatch(rendered, /TIP/u);
		assert.match(rendered, /󰧑 Skills \(2\) ✓   AGENTS\.md ✓   Extensions \(\d+\) ✓/u);
		assert.deepEqual(calls[1], { key: startupHeroWidgetKey, value: undefined, placement: "aboveEditor" });
	} finally {
		process.argv = originalArgv;
	}
});

test("startup hero stays hidden when startup enters resume selection", () => {
	const originalArgv = process.argv;
	process.argv = ["node", "nexus", "--resume"];

	try {
		const { sessionStartHandler, ctx, calls } = createStartupHeroHarness();
		sessionStartHandler?.({ reason: "startup" }, ctx);

		assert.deepEqual(calls, [{ key: startupHeroWidgetKey, value: undefined, placement: "aboveEditor" }]);
	} finally {
		process.argv = originalArgv;
	}
});

test("startup hero stays hidden on resumed sessions and clears on shutdown", () => {
	const originalArgv = process.argv;
	process.argv = ["node", "nexus"];

	try {
		const { sessionStartHandler, sessionShutdownHandler, ctx, calls } = createStartupHeroHarness();
		sessionStartHandler?.({ reason: "resume" }, ctx);
		sessionShutdownHandler?.({}, ctx);

		assert.deepEqual(calls, [
			{ key: startupHeroWidgetKey, value: undefined, placement: "aboveEditor" },
			{ key: startupHeroWidgetKey, value: undefined, placement: "aboveEditor" },
		]);
	} finally {
		process.argv = originalArgv;
	}
});

test("startup hero stays hidden for direct resume launches rewritten to --session", () => {
	const originalArgv = process.argv;
	const originalResumeLaunch = process.env[resumeLaunchEnvVar];
	process.argv = ["node", "nexus", "--session", "019dd102-45e8-76f8-8cbd-1f029c108591"];
	process.env[resumeLaunchEnvVar] = "1";

	try {
		const { sessionStartHandler, ctx, calls } = createStartupHeroHarness();
		sessionStartHandler?.({ reason: "startup" }, ctx);

		assert.deepEqual(calls, [{ key: startupHeroWidgetKey, value: undefined, placement: "aboveEditor" }]);
	} finally {
		process.argv = originalArgv;
		if (originalResumeLaunch === undefined) delete process.env[resumeLaunchEnvVar];
		else process.env[resumeLaunchEnvVar] = originalResumeLaunch;
	}
});
