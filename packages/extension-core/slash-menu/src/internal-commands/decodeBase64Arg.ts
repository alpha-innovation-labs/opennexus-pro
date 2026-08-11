/**
 * Decodes one base64-encoded UTF-8 command argument.
 *
 * @param value Encoded value.
 * @returns Decoded text.
 */
export function decodeBase64Arg(value: string): string {
	return Buffer.from(value, "base64").toString("utf8");
}
