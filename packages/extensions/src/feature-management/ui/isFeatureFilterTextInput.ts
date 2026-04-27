/**
 * Checks whether a key payload should append to the feature filter query.
 *
 * @param data Raw keyboard input payload.
 * @returns True when the payload is printable text.
 */
export function isFeatureFilterTextInput(data: string): boolean {
	return data.length === 1 && data >= " " && data !== "\u007f";
}
