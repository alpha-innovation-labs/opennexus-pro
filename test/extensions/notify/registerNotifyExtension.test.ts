import assert from "node:assert/strict";
import test from "node:test";
import { registerNotifyExtension } from "../../../packages/extensions/src/notify/registerNotifyExtension.js";
import { withLockedNotifyEnv } from "../../support/notify/withLockedNotifyEnv.js";

test("notify extension registers an agent_end handler", async () => {
	await withLockedNotifyEnv(async () => {
		let agentEndHandler: (() => Promise<void>) | undefined;

		registerNotifyExtension({
			on(eventName: string, handler: () => Promise<void> | void) {
				if (eventName === "agent_end") agentEndHandler = async () => await handler();
			},
		} as never);

		assert.ok(agentEndHandler);
	});
});
