/**
 * Formats arbitrary LSP JSON into readable text without hiding raw server data.
 *
 * @param value Value returned by a language server.
 * @returns Pretty JSON or string value.
 */
export function formatJson(value: unknown): string {
	if (typeof value === "string") return value;
	return JSON.stringify(value, null, 2);
}
