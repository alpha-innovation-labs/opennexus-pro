/**
 * Checks whether raw input should be appended to the extension search query.
 *
 * @param data Raw input.
 * @returns True when the input is printable single-character text.
 */
export function isExtensionManagerTextInput(data: string): boolean {
	return data.length === 1 && data >= " " && data !== "\u007f";
}
