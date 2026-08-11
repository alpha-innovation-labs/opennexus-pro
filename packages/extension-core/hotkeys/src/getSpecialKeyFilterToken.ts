import { Key, matchesKey } from "@earendil-works/pi-tui";

/**
 * Converts special terminal keys into filter tokens.
 *
 * @param data Raw terminal input.
 * @returns Special key token, when recognized.
 */
export function getSpecialKeyFilterToken(data: string): string | undefined {
	if (matchesKey(data, Key.tab)) return "tab";
	if (matchesKey(data, Key.enter)) return "enter";
	if (matchesKey(data, Key.up)) return "up";
	if (matchesKey(data, Key.down)) return "down";
	if (matchesKey(data, Key.left)) return "left";
	if (matchesKey(data, Key.right)) return "right";
	if (matchesKey(data, Key.delete)) return "delete";
	return undefined;
}
