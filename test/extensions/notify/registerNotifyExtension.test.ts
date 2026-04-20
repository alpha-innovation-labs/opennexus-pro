import assert from "node:assert/strict";
import test from "node:test";
import { registerNotifyExtension } from "../../../src/extensions/notify/registerNotifyExtension.js";
import { withLockedNotifyEnv } from "../../support/notify/withLockedNotifyEnv.js";

test("notify extension sends a desktop notification when the agent ends", async () => {
	await withLockedNotifyEnv(async () => {
		const previousWrite = process.stdout.write.bind(process.stdout);
		const previousOverride = process.env.NEXUS_NOTIFY_SOUND_CMD;
		let agentEndHandler: (() => Promise<void>) | undefined;
		const writes: string[] = [];
		process.env.NEXUS_NOTIFY_SOUND_CMD = " ";
		process.stdout.write = ((chunk: string | Uint8Array) => {
			writes.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
			return true;
		}) as typeof process.stdout.write;
		try {
			registerNotifyExtension({
				on(eventName: string, handler: () => Promise<void> | void) {
					if (eventName === "agent_end") agentEndHandler = async () => await handler();
				},
			} as never);
			assert.ok(agentEndHandler);
			await agentEndHandler?.();
			assert.deepEqual(writes, ["\u001b]777;notify;Nexus;Ready for input\u0007"]);
		} finally {
			if (previousOverride === undefined) delete process.env.NEXUS_NOTIFY_SOUND_CMD;
			else process.env.NEXUS_NOTIFY_SOUND_CMD = previousOverride;
			process.stdout.write = previousWrite as typeof process.stdout.write;
		}
	});
});
