import type { KeyId } from "@mariozechner/pi-tui";

/**
 * Converts a configured key or key array into normalized shortcut ids.
 *
 * @param value Unknown configured key value.
 * @returns Shortcut ids.
 */
export function toShortcutKeys(value: unknown): KeyId[] {
	if (typeof value === "string") {
		return [value as KeyId];
	}
	if (Array.isArray(value)) {
		return value.filter((entry): entry is KeyId => typeof entry === "string");
	}
	return [];
}
