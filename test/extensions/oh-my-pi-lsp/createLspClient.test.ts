import assert from "node:assert/strict";
import test from "node:test";
import { createLspClient } from "../../../packages/extensions/src/oh-my-pi-lsp/client/createLspClient.js";
import type { LanguageServerConfig } from "../../../packages/extensions/src/oh-my-pi-lsp/types.js";

const missingServerConfig: LanguageServerConfig = {
	id: "missing-test-server",
	extensions: [".ts"],
	command: "definitely-missing-language-server-for-nexus-tests",
	args: ["--stdio"],
	languageId: "typescript",
};

test("createLspClient rejects missing language server executables without an uncaught process error", async () => {
	await assert.rejects(
		createLspClient(missingServerConfig, missingServerConfig.command, process.cwd()),
		/definitely-missing-language-server-for-nexus-tests|ENOENT/,
	);
});
