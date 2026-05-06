import type { JsonRpcMessage } from "../types.js";

/**
 * Parses complete JSON-RPC frames from a buffered LSP stdio stream.
 *
 * @param buffer Buffered stdout text.
 * @returns Parsed messages and remaining partial buffer.
 */
export function parseJsonRpcFrames(buffer: string): { messages: JsonRpcMessage[]; rest: string } {
	const messages: JsonRpcMessage[] = [];
	let rest = buffer;
	while (true) {
		const headerEnd = rest.indexOf("\r\n\r\n");
		if (headerEnd < 0) break;
		const header = rest.slice(0, headerEnd);
		const match = /Content-Length:\s*(\d+)/i.exec(header);
		if (!match) break;
		const length = Number(match[1]);
		const bodyStart = headerEnd + 4;
		if (rest.length < bodyStart + length) break;
		const body = rest.slice(bodyStart, bodyStart + length);
		messages.push(JSON.parse(body) as JsonRpcMessage);
		rest = rest.slice(bodyStart + length);
	}
	return { messages, rest };
}
