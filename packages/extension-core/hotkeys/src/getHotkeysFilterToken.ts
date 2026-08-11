import { getControlKeyFilterToken } from "./getControlKeyFilterToken";
import { getPrintableKeyFilterToken } from "./getPrintableKeyFilterToken";
import { getSpecialKeyFilterToken } from "./getSpecialKeyFilterToken";

/**
 * Converts one raw keypress into a hotkeys filter token.
 *
 * @param data Raw terminal input.
 * @returns Filter token for key search, when recognized.
 */
export function getHotkeysFilterToken(data: string): string | undefined {
	return (
		getSpecialKeyFilterToken(data) ??
		getControlKeyFilterToken(data) ??
		getPrintableKeyFilterToken(data)
	);
}
