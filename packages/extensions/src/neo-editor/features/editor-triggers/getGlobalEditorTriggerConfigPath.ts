import { join } from "node:path";
import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";

/**
 * Returns the global editor-trigger config file path.
 *
 * @returns Absolute global config file path.
 */
export function getGlobalEditorTriggerConfigPath(): string {
	return join(getAgentDirPath(), "editor-triggers.json");
}
