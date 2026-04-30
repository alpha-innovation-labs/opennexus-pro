import assert from "node:assert/strict";
import test from "node:test";
import { refreshAndRender } from "../../../packages/extensions/src/neo-editor/features/promptline/refreshAndRender.js";

/**
 * Creates a deferred promise for deterministic async timing assertions.
 *
 * @returns Deferred promise controls.
 */
function createDeferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => {
		resolve = done;
	});
	return { promise, resolve };
}

test("refreshAndRender does not block on git, transport, or usage refresh work", async () => {
	const execResult = createDeferred<{ code: number; stdout: string }>();
	let execStarted = false;
	const ctx = {
		cwd: process.cwd(),
		model: undefined,
		sessionManager: { getSessionFile: () => "session.jsonl" },
	} as never;
	const deps = {
		exec: async () => {
			execStarted = true;
			return execResult.promise;
		},
	} as never;

	await refreshAndRender(ctx, deps);

	assert.equal(execStarted, true);
	execResult.resolve({ code: 0, stdout: "# branch.head main\n" });
});
