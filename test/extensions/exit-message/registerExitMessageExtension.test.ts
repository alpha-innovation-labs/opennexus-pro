import assert from "node:assert/strict";
import test from "node:test";
import { registerExitMessageExtension } from "../../../src/extensions/exit-message/registerExitMessageExtension.js";
import { clearExitMessage } from "../../../src/extensions/exit-message/state/clearExitMessage.js";
import { getExitMessage } from "../../../src/extensions/exit-message/state/getExitMessage.js";

test("exit-message refreshes from the current session title during the session", async () => {
	clearExitMessage();
	let sessionStartHandler: (() => void) | undefined;
	let turnEndHandler: (() => void) | undefined;
	let title = "Initial title";
	const pi = {
		getSessionName() {
			return title;
		},
		on(eventName: string, handler: (event?: unknown, ctx?: { hasUI: boolean }) => void) {
			if (eventName === "session_start") sessionStartHandler = () => handler();
			if (eventName === "turn_end") turnEndHandler = () => handler();
		},
	};

	registerExitMessageExtension(pi as never);
	assert.ok(sessionStartHandler);
	assert.ok(turnEndHandler);
	sessionStartHandler?.();
	assert.equal(getExitMessage(), "Session title: Initial title");
	title = "Current system title";
	turnEndHandler?.();
	assert.equal(getExitMessage(), "Session title: Current system title");
	clearExitMessage();
});

test("exit-message skips non-interactive shutdowns", async () => {
	clearExitMessage();
	let shutdownHandler: ((event: unknown, ctx: { hasUI: boolean }) => void) | undefined;
	const pi = {
		getSessionName() {
			return "Current system title";
		},
		on(eventName: string, handler: (event: unknown, ctx: { hasUI: boolean }) => void) {
			if (eventName === "session_shutdown") shutdownHandler = handler;
		},
	};

	registerExitMessageExtension(pi as never);
	assert.ok(shutdownHandler);
	shutdownHandler?.({}, { hasUI: false });
	assert.equal(getExitMessage(), undefined);
	clearExitMessage();
});
