import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getGlobalEditorTriggerConfigPath } from "./getGlobalEditorTriggerConfigPath.js";
import type { EditorTriggerConfig } from "./types.js";

/**
 * Writes the global editor-trigger config file.
 *
 * @param config Trigger config to persist.
 */
export async function writeEditorTriggerConfig(config: EditorTriggerConfig): Promise<void> {
  const path = getGlobalEditorTriggerConfigPath();
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
