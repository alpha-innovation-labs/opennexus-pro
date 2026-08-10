import { join } from "node:path";
import { getProjectConfigDirPath } from "@nexus/runtime/config/getProjectConfigDirPath.js";

/**
 * Returns the project editor-trigger config file path.
 *
 * @param cwd Project working directory.
 * @returns Absolute project config file path.
 */
export function getEditorTriggerConfigPath(cwd: string): string {
	return join(getProjectConfigDirPath(cwd), "extensions", "neo-editor", "editor-triggers.json");
}
