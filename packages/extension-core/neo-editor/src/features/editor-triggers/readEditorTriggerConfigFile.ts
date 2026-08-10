import { readFile } from "node:fs/promises";
import type { EditorTriggerConfig } from "./types";

/**
 * Reads one editor-trigger config file.
 *
 * @param path Absolute config file path.
 * @returns Parsed config or an empty default config.
 */
export async function readEditorTriggerConfigFile(path: string): Promise<EditorTriggerConfig> {
	try {
		const content = await readFile(path, "utf8");
		const parsed = JSON.parse(content) as Partial<EditorTriggerConfig>;
		return {
			rules: Array.isArray(parsed.rules) ? parsed.rules : [],
		};
	} catch {
		return { rules: [] };
	}
}
