/**
 * Encodes one slash-menu value for safe slash command transport.
 *
 * @param value Raw value.
 * @returns Base64 encoded value.
 */
export function encodeSlashMenuValue(value: string): string {
	return Buffer.from(value, "utf8").toString("base64");
}
