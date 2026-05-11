import type { LanguageServerConfig, LspClient } from "../types.js";
import { findExecutablePath } from "../config/findExecutablePath.js";
import { createLspClient } from "./createLspClient.js";

/**
 * Owns language server clients for the current extension session.
 */
export class LspClientPool {
	private readonly clients = new Map<string, Promise<LspClient>>();

	/**
	 * Gets or starts a language server client.
	 *
	 * @param root Workspace root.
	 * @param config Language server configuration.
	 * @returns Active client promise.
	 */
	get(root: string, config: LanguageServerConfig): Promise<LspClient> {
		const key = `${root}:${config.id}`;
		const existing = this.clients.get(key);
		if (existing) return existing;
		const executable = findExecutablePath(root, config.command);
		const client = createLspClient(config, executable, root).catch((error: unknown) => {
			if (this.clients.get(key) === client) this.clients.delete(key);
			throw error;
		});
		this.clients.set(key, client);
		return client;
	}

	/** Stops all managed language servers. */
	stopAll(): void {
		for (const client of this.clients.values()) void client.then((value) => value.stop()).catch(() => undefined);
		this.clients.clear();
	}
}
