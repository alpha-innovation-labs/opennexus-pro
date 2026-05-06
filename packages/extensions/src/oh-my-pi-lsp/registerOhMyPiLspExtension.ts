import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { LspClientPool } from "./client/LspClientPool.js";
import { executeLspTool } from "./tool/executeLspTool.js";
import { lspToolSchema } from "./tool/lspToolSchema.js";

/**
 * Registers the in-house Oh My Pi LSP extension.
 *
 * @param pi Pi extension API.
 */
export function registerOhMyPiLspExtension(pi: ExtensionAPI): void {
	const pool = new LspClientPool();
	pi.registerTool({
		name: "lsp",
		label: "LSP",
		description: "Language Server Protocol operations ported from Oh My Pi: diagnostics, definition, type definition, implementation, references, hover, symbols, rename, code actions, capabilities, raw request, status, and reload.",
		promptSnippet: "Use lsp for symbol-aware code navigation, diagnostics, references, rename previews, and language-server code actions.",
		promptGuidelines: [
			"Use lsp for symbol-aware operations when a language server is available, especially definitions, references, hover, rename, and code actions.",
			"Do not perform cross-file symbol renames with text replacement when lsp rename is available.",
		],
		parameters: lspToolSchema(),
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const text = await executeLspTool(pool, params, ctx);
			return { content: [{ type: "text", text }], details: { action: params.action } };
		},
	});
	pi.on("session_shutdown", () => { pool.stopAll(); });
}
