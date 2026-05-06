/**
 * Checks whether a key payload should be appended to memory search text.
 *
 * @param data Raw keyboard input.
 * @returns True when the input is printable search text.
 */
export function isMemoryFilterTextInput(data: string): boolean {
	return data.length === 1 && data >= " " && data !== "\u007f";
}
