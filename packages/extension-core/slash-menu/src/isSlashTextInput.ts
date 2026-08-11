/**
 * Checks whether a key payload should be treated as slash-query text input.
 *
 * @param data Raw input payload.
 * @returns True when the payload is printable text.
 */
export function isSlashTextInput(data: string): boolean {
	return data.length === 1 && data >= " " && data !== "\u007f";
}
