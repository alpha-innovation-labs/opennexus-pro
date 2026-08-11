import { getBundledEditorTriggerConfig } from "./getBundledEditorTriggerConfig";
import { getEditorTriggerConfigPath } from "./getEditorTriggerConfigPath";
import { getGlobalEditorTriggerConfigPath } from "./getGlobalEditorTriggerConfigPath";
import { mergeEditorTriggerConfigs } from "./mergeEditorTriggerConfigs";
import { readEditorTriggerConfigFile } from "./readEditorTriggerConfigFile";
import type { EditorTriggerConfig } from "./types";

/**
 * Reads merged global and project editor-trigger config.
 *
 * @param cwd Project working directory.
 * @returns Merged trigger config.
 */
export async function readEditorTriggerConfig(
	cwd: string,
): Promise<EditorTriggerConfig> {
	const [globalConfig, projectConfig] = await Promise.all([
		readEditorTriggerConfigFile(getGlobalEditorTriggerConfigPath()),
		readEditorTriggerConfigFile(getEditorTriggerConfigPath(cwd)),
	]);
	return mergeEditorTriggerConfigs(
		getBundledEditorTriggerConfig(),
		globalConfig,
		projectConfig,
	);
}
