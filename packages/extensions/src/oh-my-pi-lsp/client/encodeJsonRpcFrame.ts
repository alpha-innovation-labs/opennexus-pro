/**
 * Encodes a JSON-RPC payload as an LSP stdio frame.
 *
 * @param message JSON-RPC message payload.
 * @returns Framed message text.
 */
export function encodeJsonRpcFrame(message: unknown): string {
	const body = JSON.stringify(message);
	return `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}
