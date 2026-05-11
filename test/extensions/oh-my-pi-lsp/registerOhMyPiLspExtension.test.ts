import assert from "node:assert/strict";
import test from "node:test";
import { registerOhMyPiLspExtension } from "../../../packages/extensions-dev/src/oh-my-pi-lsp/registerOhMyPiLspExtension.js";

/**
 * Regression coverage for extension registration wiring.
 */
test("oh-my-pi-lsp registers the lsp tool and shutdown cleanup", () => {
	const tools: Array<{ name: string; description: string }> = [];
	const events: string[] = [];
	const pi = {
		registerTool(tool: { name: string; description: string }) { tools.push(tool); },
		on(name: string) { events.push(name); },
	};

	registerOhMyPiLspExtension(pi as never);

	assert.equal(tools[0]?.name, "lsp");
	assert.match(tools[0]?.description ?? "", /Language Server Protocol/);
	assert.deepEqual(events, ["session_shutdown"]);
});
