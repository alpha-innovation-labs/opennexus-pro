import * as fs from "node:fs/promises";
import type { LanguageServerConfig, LspClient } from "../types.js";
import { toFileUri } from "../workspace/toFileUri.js";

/**
 * Opens the current on-disk document in a language server.
 *
 * @param client Active LSP client.
 * @param config Language server configuration.
 * @param filePath Absolute file path.
 * @returns Text document identifier used by LSP requests.
 */
export async function openDocument(client: LspClient, config: LanguageServerConfig, filePath: string): Promise<{ uri: string }> {
	const text = await fs.readFile(filePath, "utf8");
	const uri = toFileUri(filePath);
	client.notify("textDocument/didOpen", { textDocument: { uri, languageId: config.languageId, version: 1, text } });
	return { uri };
}
