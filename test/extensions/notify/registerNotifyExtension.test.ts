import assert from "node:assert/strict";
import test from "node:test";
import { registerNotifyExtension } from "../../../packages/extensions/src/notify/registerNotifyExtension.js";

/**
 * Creates a fake Pi API that captures the agent_end handler.
 *
 * @param capture Stores the captured event handler.
 * @returns Minimal fake Pi API.
 */
function createNotifyTestPi(capture: { handler?: (event: unknown, ctx: { hasUI: boolean }) => Promise<void> }): unknown {
	return {
		on(eventName: string, handler: (event: unknown, ctx: { hasUI: boolean }) => Promise<void>) {
			if (eventName === "agent_end") capture.handler = handler;
		},
	};
}

test("notify extension skips terminal notifications without UI", async () => {
	const capture: { handler?: (event: unknown, ctx: { hasUI: boolean }) => Promise<void> } = {};
	const writes: string[] = [];
	const previousWrite = process.stdout.write.bind(process.stdout);
	process.stdout.write = ((chunk: string | Uint8Array) => {
		writes.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
		return true;
	}) as typeof process.stdout.write;
	try {
		registerNotifyExtension(createNotifyTestPi(capture) as never);
		assert.ok(capture.handler);
		await capture.handler?.({}, { hasUI: false });
		assert.deepEqual(writes, []);
	} finally {
		process.stdout.write = previousWrite as typeof process.stdout.write;
	}
});
