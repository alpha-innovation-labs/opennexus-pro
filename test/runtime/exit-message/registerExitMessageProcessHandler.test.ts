import assert from "node:assert/strict";
import test from "node:test";
import { setExitMessage } from "../../../src/extensions/exit-message/state/setExitMessage.js";
import { getExitMessage } from "../../../src/extensions/exit-message/state/getExitMessage.js";
import { registerExitMessageProcessHandler } from "../../../src/runtime/exit-message/registerExitMessageProcessHandler.js";

test("registerExitMessageProcessHandler prints the queued message on process exit", () => {
	const originalOnce = process.once.bind(process);
	const originalWrite = process.stdout.write.bind(process.stdout);
	const callbacks: Array<() => void> = [];
	const output: string[] = [];
	let onceCount = 0;

	process.once = ((event: string, listener: () => void) => {
		if (event === "exit") {
			onceCount += 1;
			callbacks.push(listener);
			return process;
		}
		return originalOnce(event as never, listener as never);
	}) as typeof process.once;
	process.stdout.write = ((chunk: string | Uint8Array) => {
		output.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"));
		return true;
	}) as typeof process.stdout.write;

	try {
		setExitMessage("Session title: Current system title");
		registerExitMessageProcessHandler();
		assert.equal(onceCount, 1);
		callbacks[0]?.();
		assert.deepEqual(output, ["Session title: Current system title\n"]);
		assert.equal(getExitMessage(), undefined);
	} finally {
		process.once = originalOnce as typeof process.once;
		process.stdout.write = originalWrite as typeof process.stdout.write;
	}
});
