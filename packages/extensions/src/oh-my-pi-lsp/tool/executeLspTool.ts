import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { LanguageServerConfig, LspClient, LspToolParams } from "../types.js";
import { findServerConfig } from "../config/findServerConfig.js";
import { languageServerConfigs } from "../config/languageServerConfigs.js";
import { LspClientPool } from "../client/LspClientPool.js";
import { openDocument } from "../client/openDocument.js";
import { formatJson } from "../format/formatJson.js";
import { formatLocations } from "../format/formatLocations.js";
import { createPosition } from "./createPosition.js";
import { resolveProjectPath } from "../workspace/resolveProjectPath.js";

/**
 * Executes one Oh My Pi style LSP operation.
 *
 * @param pool Shared LSP client pool.
 * @param params Tool parameters.
 * @param ctx Pi extension context.
 * @returns Text to return to the model.
 */
export async function executeLspTool(pool: LspClientPool, params: LspToolParams, ctx: ExtensionContext): Promise<string> {
	if (params.action === "status") return languageServerConfigs().map((config) => `${config.id}: ${config.command} ${config.args.join(" ")}`.trim()).join("\n");
	if (params.action === "reload") { pool.stopAll(); return "Restarted LSP clients."; }
	const filePath = requireFile(ctx.cwd, params.file);
	const config = findServerConfig(filePath);
	if (!config) throw new Error(`No language server config for ${filePath}`);
	const client = await prepareClient(pool, ctx.cwd, config, filePath);
	const timeoutMs = Math.max(5, Math.min(params.timeout ?? 20, 60)) * 1000;
	return runRequest(client, filePath, params, timeoutMs);
}

/**
 * Starts a client and opens the target document.
 *
 * @param pool Shared LSP client pool.
 * @param cwd Workspace root.
 * @param config Language server configuration.
 * @param filePath Target file path.
 * @returns Client and document URI.
 */
async function prepareClient(pool: LspClientPool, cwd: string, config: LanguageServerConfig, filePath: string): Promise<LspClient & { uri: string }> {
	const client = await pool.get(cwd, config);
	const { uri } = await openDocument(client, config, filePath);
	return Object.assign(client, { uri });
}

/**
 * Runs the selected LSP request against an initialized client.
 *
 * @param client Active client plus opened URI.
 * @param filePath Target file path.
 * @param params Tool parameters.
 * @param timeoutMs Request timeout in milliseconds.
 * @returns Formatted result text.
 */
async function runRequest(client: LspClient & { uri: string }, filePath: string, params: LspToolParams, timeoutMs: number): Promise<string> {
	if (params.action === "diagnostics") return formatJson(client.getDiagnostics(client.uri));
	if (params.action === "capabilities") return formatJson(client.getCapabilities());
	if (params.action === "request") return formatJson(await client.request(requireQuery(params), parsePayload(params.payload), timeoutMs));
	const position = params.line ? createPosition(filePath, params.line, params.symbol) : undefined;
	const textDocument = { uri: client.uri };
	switch (params.action) {
		case "hover": return formatJson(await client.request("textDocument/hover", { textDocument, position }, timeoutMs));
		case "definition": return formatLocations(await client.request("textDocument/definition", { textDocument, position }, timeoutMs));
		case "type_definition": return formatLocations(await client.request("textDocument/typeDefinition", { textDocument, position }, timeoutMs));
		case "implementation": return formatLocations(await client.request("textDocument/implementation", { textDocument, position }, timeoutMs));
		case "references": return formatLocations(await client.request("textDocument/references", { textDocument, position, context: { includeDeclaration: true } }, timeoutMs));
		case "symbols": return formatJson(await client.request("textDocument/documentSymbol", { textDocument }, timeoutMs));
		case "rename": return formatJson(await client.request("textDocument/rename", { textDocument, position, newName: requireNewName(params) }, timeoutMs));
		case "code_actions": return formatJson(await client.request("textDocument/codeAction", { textDocument, range: { start: position, end: position }, context: { diagnostics: [] } }, timeoutMs));
		default: throw new Error(`Unsupported LSP action: ${params.action}`);
	}
}

/**
 * Resolves and requires a file parameter.
 *
 * @param cwd Workspace root.
 * @param file User-supplied file path.
 * @returns Absolute file path.
 */
function requireFile(cwd: string, file?: string): string { if (!file || file === "*") throw new Error("This operation requires a concrete file path."); return resolveProjectPath(cwd, file); }

/**
 * Requires the raw request method query.
 *
 * @param params Tool parameters.
 * @returns LSP request method name.
 */
function requireQuery(params: LspToolParams): string { if (!params.query) throw new Error("request requires query with the LSP method name."); return params.query; }

/**
 * Requires a rename target.
 *
 * @param params Tool parameters.
 * @returns New symbol name.
 */
function requireNewName(params: LspToolParams): string { if (!params.new_name) throw new Error("rename requires new_name."); return params.new_name; }

/**
 * Parses optional JSON payload for raw requests.
 *
 * @param payload JSON string.
 * @returns Parsed payload or undefined.
 */
function parsePayload(payload?: string): unknown { return payload ? JSON.parse(payload) : undefined; }
