import assert from "node:assert/strict";
import test from "node:test";
import { showTetrisModal } from "../../../packages/mini-apps/src/tetris/command/showTetrisModal.js";

/**
 * Creates a command context that captures the custom UI options.
 *
 * @returns Fake command context and captured custom call options.
 */
function createTetrisModalContext(): { ctx: any; calls: any[] } {
	const calls: any[] = [];
	return {
		calls,
		ctx: {
			hasUI: true,
			ui: {
				custom(_factory: unknown, options: unknown): Promise<void> {
					calls.push(options);
					return Promise.resolve();
				},
			},
		},
	};
}

test("tetris modal overlay allows shared fullscreen height and full-width compositing", async () => {
	const { ctx, calls } = createTetrisModalContext();

	await showTetrisModal(ctx);

	assert.deepEqual(calls[0], {
		overlay: true,
		overlayOptions: {
			anchor: "center",
			width: "100%",
			minWidth: 116,
			maxHeight: "100%",
		},
	});
});
