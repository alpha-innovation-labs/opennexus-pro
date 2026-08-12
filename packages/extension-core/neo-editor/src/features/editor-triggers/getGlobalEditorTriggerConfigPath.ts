import { getUserEditorTriggersPath } from "@nexus/runtime";

/**
 * Returns the global editor-trigger config file path.
 *
 * @returns Absolute global config file path.
 */
export function getGlobalEditorTriggerConfigPath(): string {
	return getUserEditorTriggersPath();
}
