import type { EditorTriggerConfig } from "./types";

/**
 * Merges bundled, global, and project trigger configs with project precedence.
 *
 * @param bundledConfig Bundled default config.
 * @param globalConfig Global trigger config.
 * @param projectConfig Project trigger config.
 * @returns Merged trigger config.
 */
export function mergeEditorTriggerConfigs(
	bundledConfig: EditorTriggerConfig,
	globalConfig: EditorTriggerConfig,
	projectConfig: EditorTriggerConfig,
): EditorTriggerConfig {
	return {
		rules: [
			...bundledConfig.rules,
			...globalConfig.rules,
			...projectConfig.rules,
		],
	};
}
