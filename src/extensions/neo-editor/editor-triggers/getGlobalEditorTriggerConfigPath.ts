import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Returns the global editor-trigger config file path.
 *
 * @returns Absolute global config file path.
 */
export function getGlobalEditorTriggerConfigPath(): string {
	return join(homedir(), ".pi", "agent", "editor-triggers.json");
}
