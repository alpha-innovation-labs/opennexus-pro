import type { EditorTriggerConfig } from "./types";

/**
 * Merges global and project trigger configs with project precedence.
 *
 * @param globalConfig Global trigger config.
 * @param projectConfig Project trigger config.
 * @returns Merged trigger config.
 */
export function mergeEditorTriggerConfigs(
	globalConfig: EditorTriggerConfig,
	projectConfig: EditorTriggerConfig,
): EditorTriggerConfig {
	return {
		rules: [...globalConfig.rules, ...projectConfig.rules],
	};
}
