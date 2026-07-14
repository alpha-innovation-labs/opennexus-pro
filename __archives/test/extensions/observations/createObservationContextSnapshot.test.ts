import assert from "node:assert/strict";
import test from "node:test";
import { createObservationContextSnapshot } from "../../../packages/extensions-pro/src/observations/tracker/createObservationContextSnapshot.js";

test("observation context snapshot copies cwd and model before queued work", () => {
	const model = { provider: "openai", id: "gpt-4o" };
	const ctx = { cwd: "/tmp/project", model };
	const snapshot = createObservationContextSnapshot(ctx as never);
	model.id = "changed";
	assert.deepEqual(snapshot, { cwd: "/tmp/project", model: { provider: "openai", id: "gpt-4o" } });
});
