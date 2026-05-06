import { existsSync, readFileSync } from "node:fs";

/**
 * Reads one JSON keybindings file as a plain object.
 *
 * @param path Keybindings file path.
 * @returns Parsed record or an empty object when missing or invalid.
 */
export function readKeybindingConfig(path: string): Record<string, unknown> {
	if (!existsSync(path)) {
		return {};
	}
	try {
		const parsed = JSON.parse(readFileSync(path, "utf-8"));
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return {};
		}
		return parsed as Record<string, unknown>;
	} catch {
		return {};
	}
}
