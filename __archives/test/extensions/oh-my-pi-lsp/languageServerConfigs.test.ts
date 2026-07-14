import assert from "node:assert/strict";
import test from "node:test";
import { findServerConfig } from "../../../packages/extensions-dev/src/oh-my-pi-lsp/config/findServerConfig.js";
import { languageServerConfigs } from "../../../packages/extensions-dev/src/oh-my-pi-lsp/config/languageServerConfigs.js";

/**
 * Regression coverage for the in-house Oh My Pi LSP server registry.
 */
test("oh-my-pi-lsp exposes a broad language server registry", () => {
	const configs = languageServerConfigs();

	assert.ok(configs.length >= 37);
	assert.equal(findServerConfig("src/example.ts")?.id, "typescript");
	assert.equal(findServerConfig("main.rs")?.command, "rust-analyzer");
	assert.equal(findServerConfig("Dockerfile")?.languageId, "dockerfile");
});
