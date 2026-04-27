import { join } from "node:path";
import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";
import { getProjectConfigDirPath } from "@nexus/runtime/config/getProjectConfigDirPath.js";

/**
 * Returns the global and project keybinding file paths in precedence order.
 *
 * @param cwd Active project working directory.
 * @returns Candidate keybinding config paths.
 */
export function getTermKeybindingPaths(cwd: string): string[] {
	return [join(getAgentDirPath(), "keybindings.json"), join(getProjectConfigDirPath(cwd), "keybindings.json")];
}
