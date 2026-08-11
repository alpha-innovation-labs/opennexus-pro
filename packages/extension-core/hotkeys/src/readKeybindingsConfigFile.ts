import { readFileSync } from "node:fs";

/**
 * Reads a keybindings config object from disk, ignoring missing or invalid files.
 *
 * @param configPath Absolute keybindings.json path.
 * @returns Parsed config object or an empty object.
 */
export function readKeybindingsConfigFile(
	configPath: string,
): Record<string, string | string[] | undefined> {
	try {
		const parsed = JSON.parse(readFileSync(configPath, "utf-8"));
		return parsed && typeof parsed === "object" && !Array.isArray(parsed)
			? (parsed as Record<string, string | string[] | undefined>)
			: {};
	} catch {
		return {};
	}
}
