export type LspAction = "diagnostics" | "definition" | "type_definition" | "implementation" | "references" | "hover" | "symbols" | "rename" | "code_actions" | "status" | "capabilities" | "request" | "reload";

export interface LanguageServerConfig {
	id: string;
	extensions: string[];
	command: string;
	args: string[];
	languageId: string;
}

export interface LspToolParams {
	action: LspAction;
	file?: string;
	line?: number;
	symbol?: string;
	query?: string;
	new_name?: string;
	apply?: boolean;
	payload?: string;
	timeout?: number;
}

export interface JsonRpcMessage {
	jsonrpc: "2.0";
	id?: number | string;
	method?: string;
	params?: unknown;
	result?: unknown;
	error?: { code: number; message: string; data?: unknown };
}

export interface LspClient {
	id: string;
	request(method: string, params?: unknown, timeoutMs?: number): Promise<unknown>;
	notify(method: string, params?: unknown): void;
	stop(): void;
	getDiagnostics(uri?: string): unknown[];
	getCapabilities(): unknown;
}

export interface ClientKey {
	root: string;
	serverId: string;
}
