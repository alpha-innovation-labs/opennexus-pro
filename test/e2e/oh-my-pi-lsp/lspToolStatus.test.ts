import assert from "node:assert/strict";
import test from "node:test";
import { registerOhMyPiLspExtension } from "../../../packages/extensions/src/oh-my-pi-lsp/registerOhMyPiLspExtension.js";

/**
 * E2E regression coverage for the bundled LSP extension registration path.
 */
test("oh-my-pi-lsp exposes status through the registered lsp tool", async () => {
	let tool: { execute: (...args: unknown[]) => Promise<{ content: Array<{ text: string }> }> } | undefined;
	const pi = {
		registerTool(definition: typeof tool) { tool = definition; },
		on() {},
	};

	registerOhMyPiLspExtension(pi as never);
	const result = await tool?.execute("tool-call", { action: "status" }, undefined, undefined, { cwd: process.cwd() });
	const text = result?.content[0]?.text ?? "";

	assert.match(text, /typescript-language-server/u);
	assert.match(text, /rust-analyzer/u);
});
