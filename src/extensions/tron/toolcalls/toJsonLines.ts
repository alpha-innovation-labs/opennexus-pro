import { sanitizePlainText } from "../../shared/two-pane-select-modal/index.js";

/**
 * Serializes a value into sanitized JSON lines.
 *
 * @param value Value to serialize.
 * @returns JSON lines.
 */
export function toJsonLines(value: unknown): string[] {
	const text = JSON.stringify(value ?? {}, null, 2) ?? "{}";
	return sanitizePlainText(text).split("\n");
}
