import assert from "node:assert/strict";
import test from "node:test";
import { registerExitMessageExtension } from "../../../src/extensions/exit-message/registerExitMessageExtension.js";
import { clearExitMessage } from "../../../src/extensions/exit-message/state/clearExitMessage.js";
import { getExitMessage } from "../../../src/extensions/exit-message/state/getExitMessage.js";

test("exit-message refreshes from the current session id and title during the session", async () => {
	clearExitMessage();
	let sessionStartHandler: ((event: unknown, ctx: TestContext) => void) | undefined;
	let turnEndHandler: ((event: unknown, ctx: TestContext) => void) | undefined;
	let title = "Initial title";
	const ctx = createTestContext("1f83c96f-0376-4f3b-973a-fa8c02181292", true);
	const pi = {
		getSessionName() {
			return title;
		},
		on(eventName: string, handler: (event?: unknown, ctx?: TestContext) => void) {
			if (eventName === "session_start") sessionStartHandler = handler as never;
			if (eventName === "turn_end") turnEndHandler = handler as never;
		},
	};

	registerExitMessageExtension(pi as never);
	assert.ok(sessionStartHandler);
	assert.ok(turnEndHandler);
	sessionStartHandler?.({}, ctx);
	assert.match(getExitMessage() ?? "", /╭/);
	assert.match(getExitMessage() ?? "", /nexus --resume 1f83c96f-0376-4f3b-973a-fa8c02181292/);
	assert.match(getExitMessage() ?? "", /This session's title is:/);
	assert.match(getExitMessage() ?? "", /Initial title/);

	title = "Current system title";
	turnEndHandler?.({}, ctx);
	assert.match(getExitMessage() ?? "", /Current system title/);
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
	shutdownHandler?.({}, createTestContext("session-id", false));
	assert.equal(getExitMessage(), undefined);
	clearExitMessage();
});

interface TestContext {
	hasUI: boolean;
	sessionManager: { getSessionId(): string };
}

/**
 * Creates a minimal extension context for exit-message tests.
 *
 * @param sessionId Session id returned by the session manager.
 * @param hasUI Whether the context has UI.
 * @returns Test context.
 */
function createTestContext(sessionId: string, hasUI: boolean): TestContext {
	return { hasUI, sessionManager: { getSessionId: () => sessionId } };
}
