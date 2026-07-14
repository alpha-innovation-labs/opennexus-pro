import assert from "node:assert/strict";
import test from "node:test";
import { registerExitMessageExtension } from "../../../packages/extension-core/src/exit-message/registerExitMessageExtension.js";
import { clearExitMessage } from "../../../packages/extension-core/src/exit-message/state/clearExitMessage.js";
import { getExitMessage } from "../../../packages/extension-core/src/exit-message/state/getExitMessage.js";

test("exit-message refreshes from the current session id and title after a real turn", async () => {
	clearExitMessage();
	let turnEndHandler: ((event: unknown, ctx: TestContext) => void) | undefined;
	let title = "Current system title";
	const ctx = createTestContext("1f83c96f-0376-4f3b-973a-fa8c02181292", true, [{ type: "message" }]);
	const pi = {
		getSessionName() {
			return title;
		},
		on(eventName: string, handler: (event?: unknown, ctx?: TestContext) => void) {
			if (eventName === "turn_end") turnEndHandler = handler as never;
		},
	};

	registerExitMessageExtension(pi as never);
	assert.ok(turnEndHandler);
	assert.equal(getExitMessage(), undefined);
	turnEndHandler?.({}, ctx);
	assert.match(getExitMessage() ?? "", /╭/);
	assert.match(getExitMessage() ?? "", /nexus --resume 1f83c96f-0376-4f3b-973a-fa8c02181292/);
	assert.match(getExitMessage() ?? "", /This session's title is:/);
	assert.match(getExitMessage() ?? "", /Current system title/);
	clearExitMessage();
});

test("exit-message skips fresh interactive shutdowns without real messages", async () => {
	clearExitMessage();
	let shutdownHandler: ((event: unknown, ctx: TestContext) => void) | undefined;
	const pi = {
		getSessionName() {
			return "Untitled session";
		},
		on(eventName: string, handler: (event: unknown, ctx: TestContext) => void) {
			if (eventName === "session_shutdown") shutdownHandler = handler;
		},
	};

	registerExitMessageExtension(pi as never);
	assert.ok(shutdownHandler);
	shutdownHandler?.({}, createTestContext("session-id", true, []));
	assert.equal(getExitMessage(), undefined);
	clearExitMessage();
});

test("exit-message skips non-interactive turns", async () => {
	clearExitMessage();
	let turnEndHandler: ((event: unknown, ctx: TestContext) => void) | undefined;
	const pi = {
		getSessionName() {
			return "Current system title";
		},
		on(eventName: string, handler: (event: unknown, ctx: TestContext) => void) {
			if (eventName === "turn_end") turnEndHandler = handler;
		},
	};

	registerExitMessageExtension(pi as never);
	assert.ok(turnEndHandler);
	turnEndHandler?.({}, createTestContext("session-id", false, [{ type: "message" }]));
	assert.equal(getExitMessage(), undefined);
	clearExitMessage();
});

test("exit-message skips non-interactive shutdowns", async () => {
	clearExitMessage();
	let shutdownHandler: ((event: unknown, ctx: TestContext) => void) | undefined;
	const pi = {
		getSessionName() {
			return "Current system title";
		},
		on(eventName: string, handler: (event: unknown, ctx: TestContext) => void) {
			if (eventName === "session_shutdown") shutdownHandler = handler;
		},
	};

	registerExitMessageExtension(pi as never);
	assert.ok(shutdownHandler);
	shutdownHandler?.({}, createTestContext("session-id", false, []));
	assert.equal(getExitMessage(), undefined);
	clearExitMessage();
});

interface TestContext {
	hasUI: boolean;
	sessionManager: { getEntries(): Array<{ type: string }>; getSessionId(): string };
}

/**
 * Creates a minimal extension context for exit-message tests.
 *
 * @param sessionId Session id returned by the session manager.
 * @param hasUI Whether the context has UI.
 * @param entries Session entries.
 * @returns Test context.
 */
function createTestContext(sessionId: string, hasUI: boolean, entries: Array<{ type: string }>): TestContext {
	return { hasUI, sessionManager: { getEntries: () => entries, getSessionId: () => sessionId } };
}
