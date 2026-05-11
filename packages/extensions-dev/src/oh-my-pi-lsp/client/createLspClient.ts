import { spawn } from "node:child_process";
import { encodeJsonRpcFrame } from "./encodeJsonRpcFrame.js";
import { parseJsonRpcFrames } from "./parseJsonRpcFrames.js";
import type { JsonRpcMessage, LanguageServerConfig, LspClient } from "../types.js";

/**
 * Starts one language server process and returns a JSON-RPC client.
 *
 * @param config Language server configuration.
 * @param executable Resolved executable path.
 * @param root Workspace root.
 * @returns Active LSP client.
 */
export async function createLspClient(config: LanguageServerConfig, executable: string, root: string): Promise<LspClient> {
	const child = spawn(executable, config.args, { cwd: root, stdio: "pipe" });
	const pending = new Map<number | string, { resolve(value: unknown): void; reject(error: Error): void }>();
	const diagnostics = new Map<string, unknown[]>();
	let nextId = 1;
	let buffer = "";
	let capabilities: unknown;

	child.on("error", handleProcessError);
	child.stdout.on("data", (chunk: Buffer) => {
		buffer += chunk.toString("utf8");
		const parsed = parseJsonRpcFrames(buffer);
		buffer = parsed.rest;
		for (const message of parsed.messages) handleMessage(message);
	});

	function handleMessage(message: JsonRpcMessage): void {
		if (message.method === "textDocument/publishDiagnostics") {
			const params = message.params as { uri?: string; diagnostics?: unknown[] };
			if (params.uri) diagnostics.set(params.uri, params.diagnostics ?? []);
			return;
		}
		if (message.id === undefined) return;
		const waiter = pending.get(message.id);
		if (!waiter) return;
		pending.delete(message.id);
		if (message.error) waiter.reject(new Error(message.error.message));
		else waiter.resolve(message.result);
	}

	/**
	 * Rejects pending requests when the language server process cannot start or fails.
	 *
	 * @param error Process startup or runtime error.
	 */
	function handleProcessError(error: Error): void {
		const message = error.message.includes(executable) ? error.message : `Failed to start ${executable}: ${error.message}`;
		const startupError = new Error(message);
		for (const waiter of pending.values()) waiter.reject(startupError);
		pending.clear();
	}

	/**
	 * Sends one JSON-RPC message to the language server process.
	 *
	 * @param message JSON-RPC message payload.
	 */
	function send(message: unknown): void {
		child.stdin.write(encodeJsonRpcFrame(message));
	}

	const client: LspClient = {
		id: config.id,
		request(method, params, timeoutMs = 20_000) {
			const id = nextId++;
			send({ jsonrpc: "2.0", id, method, params });
			return new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					pending.delete(id);
					reject(new Error(`LSP request timed out: ${method}`));
				}, timeoutMs);
				pending.set(id, {
					resolve: (value) => { clearTimeout(timeout); resolve(value); },
					reject: (error) => { clearTimeout(timeout); reject(error); },
				});
			});
		},
		notify(method, params) { send({ jsonrpc: "2.0", method, params }); },
		stop() { child.kill(); },
		getDiagnostics(uri) { return uri ? diagnostics.get(uri) ?? [] : [...diagnostics.values()].flat(); },
		getCapabilities() { return capabilities; },
	};

	const result = await client.request("initialize", { processId: process.pid, rootUri: `file://${root}`, capabilities: {} });
	capabilities = (result as { capabilities?: unknown }).capabilities;
	client.notify("initialized", {});
	return client;
}
