import { resolve } from "node:path";

/**
 * Returns the project editor-trigger config file path.
 *
 * @param cwd Project working directory.
 * @returns Absolute project config file path.
 */
export function getEditorTriggerConfigPath(cwd: string): string {
	return resolve(cwd, ".pi", "extensions", "neo-editor", "editor-triggers.json");
}
