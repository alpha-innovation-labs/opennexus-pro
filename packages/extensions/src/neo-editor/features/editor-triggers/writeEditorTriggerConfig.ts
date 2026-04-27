import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getEditorTriggerConfigPath } from "./getEditorTriggerConfigPath.js";
import type { EditorTriggerConfig } from "./types.js";

/**
 * Writes the project editor-trigger config file.
 *
 * @param cwd Project working directory.
 * @param config Trigger config to persist.
 */
export async function writeEditorTriggerConfig(cwd: string, config: EditorTriggerConfig): Promise<void> {
	const path = getEditorTriggerConfigPath(cwd);
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
