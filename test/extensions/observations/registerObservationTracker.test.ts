import assert from "node:assert/strict";
import test from "node:test";
import { registerObservationTracker } from "../../../packages/extensions-pro/src/observations/tracker/registerObservationTracker.js";

test("observation tracker skips non-interactive events", async () => {
	const handlers = new Map<string, (event: never, ctx: { hasUI: boolean; cwd: string }) => Promise<void>>();
	const pi = {
		on(eventName: string, handler: (event: never, ctx: { hasUI: boolean; cwd: string }) => Promise<void>) {
			handlers.set(eventName, handler);
		},
	};
	const ctx = {
		hasUI: false,
		get cwd(): string {
			throw new Error("cwd should not be read without UI");
		},
	};
	registerObservationTracker(pi as never);
	await handlers.get("message_end")?.({ message: { role: "assistant", content: [{ type: "text", text: "done" }] } } as never, ctx);
	await handlers.get("turn_end")?.({} as never, ctx);
	assert.ok(handlers.has("session_start"));
});
