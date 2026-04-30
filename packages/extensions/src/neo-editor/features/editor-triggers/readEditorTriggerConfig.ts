import { getBundledEditorTriggerConfig } from "./getBundledEditorTriggerConfig.js";
import { getEditorTriggerConfigPath } from "./getEditorTriggerConfigPath.js";
import { getGlobalEditorTriggerConfigPath } from "./getGlobalEditorTriggerConfigPath.js";
import { mergeEditorTriggerConfigs } from "./mergeEditorTriggerConfigs.js";
import { readEditorTriggerConfigFile } from "./readEditorTriggerConfigFile.js";
import type { EditorTriggerConfig } from "./types.js";

/**
 * Reads merged global and project editor-trigger config.
 *
 * @param cwd Project working directory.
 * @returns Merged trigger config.
 */
export async function readEditorTriggerConfig(cwd: string): Promise<EditorTriggerConfig> {
	const [globalConfig, projectConfig] = await Promise.all([
		readEditorTriggerConfigFile(getGlobalEditorTriggerConfigPath()),
		readEditorTriggerConfigFile(getEditorTriggerConfigPath(cwd)),
	]);
	return mergeEditorTriggerConfigs(getBundledEditorTriggerConfig(), globalConfig, projectConfig);
}
