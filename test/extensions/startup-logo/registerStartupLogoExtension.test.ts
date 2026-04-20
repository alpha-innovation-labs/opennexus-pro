import assert from "node:assert/strict";
import test from "node:test";
import { registerStartupLogoExtension } from "../../../src/extensions/startup-logo/registerStartupLogoExtension.js";
import { startupLogoWidgetKey } from "../../../src/extensions/startup-logo/startupLogoWidgetKey.js";

test("startup logo shows on fresh startup and clears on the first turn", () => {
	let sessionStartHandler:
		| ((event: { reason: string }, ctx: { hasUI: boolean; ui: { setWidget(key: string, value: string[] | undefined): void; theme: { fg(name: string, value: string): string } } }) => void)
		| undefined;
	let turnStartHandler:
		| ((event: unknown, ctx: { hasUI: boolean; ui: { setWidget(key: string, value: string[] | undefined): void } }) => void)
		| undefined;
	const calls: Array<{ key: string; value: string[] | undefined }> = [];
	const pi = {
		on(eventName: string, handler: unknown) {
			if (eventName === "session_start") sessionStartHandler = handler as typeof sessionStartHandler;
			if (eventName === "turn_start") turnStartHandler = handler as typeof turnStartHandler;
		},
	};
	const ctx = {
		hasUI: true,
		ui: {
			setWidget(key: string, value: string[] | undefined) {
				calls.push({ key, value });
			},
			theme: {
				fg(_name: string, value: string) {
					return value;
				},
			},
		},
	};

	registerStartupLogoExtension(pi as never);
	sessionStartHandler?.({ reason: "startup" }, ctx);
	turnStartHandler?.({}, ctx);

	assert.equal(calls[0]?.key, startupLogoWidgetKey);
	assert.ok(calls[0]?.value?.some((line) => line.includes("⢸⣿⡿⣿⣄ ⣿⡇")));
	assert.deepEqual(calls[1], { key: startupLogoWidgetKey, value: undefined });
});

test("startup logo stays hidden on resumed sessions", () => {
	let sessionStartHandler:
		| ((event: { reason: string }, ctx: { hasUI: boolean; ui: { setWidget(key: string, value: string[] | undefined): void } }) => void)
		| undefined;
	const calls: Array<{ key: string; value: string[] | undefined }> = [];
	const pi = {
		on(eventName: string, handler: unknown) {
			if (eventName === "session_start") sessionStartHandler = handler as typeof sessionStartHandler;
		},
	};
	const ctx = {
		hasUI: true,
		ui: {
			setWidget(key: string, value: string[] | undefined) {
				calls.push({ key, value });
			},
		},
	};

	registerStartupLogoExtension(pi as never);
	sessionStartHandler?.({ reason: "resume" }, ctx as never);

	assert.deepEqual(calls, [{ key: startupLogoWidgetKey, value: undefined }]);
});
