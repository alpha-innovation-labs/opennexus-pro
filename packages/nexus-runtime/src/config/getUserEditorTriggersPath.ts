import { join } from "node:path";
import { getUserConfigDirPath } from "./getUserConfigDirPath";

/**
 * Resolves the Nexus global user editor triggers file path.
 *
 * @returns Absolute user editor triggers file path.
 */
export function getUserEditorTriggersPath(): string {
	return join(getUserConfigDirPath(), "editor-triggers.json");
}
