/**
 * Returns whether one CLI token requests the resume picker.
 *
 * @param value CLI token.
 * @returns True when the token is a resume selector flag.
 */
export function isResumeSelectorFlag(value: string): boolean {
	return value === "--resume" || value === "-r";
}
