/**
 * Converts ASCII control-letter input into a ctrl+key filter token.
 *
 * @param data Raw terminal input.
 * @returns Ctrl key token, when the input is a control-letter chord.
 */
export function getControlKeyFilterToken(data: string): string | undefined {
	if (data.length !== 1) return undefined;
	const code = data.charCodeAt(0);
	if (code < 1 || code > 26) return undefined;
	return `ctrl+${String.fromCharCode(code + 96)}`;
}
