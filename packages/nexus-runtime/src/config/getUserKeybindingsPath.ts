import { join } from "node:path";
import { getUserConfigDirPath } from "./getUserConfigDirPath";

/**
 * Resolves the Nexus global user keybindings file path.
 *
 * @returns Absolute user keybindings file path.
 */
export function getUserKeybindingsPath(): string {
	return join(getUserConfigDirPath(), "keybindings.json");
}
