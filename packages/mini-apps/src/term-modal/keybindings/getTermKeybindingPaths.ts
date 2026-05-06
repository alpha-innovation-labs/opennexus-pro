import { join } from "node:path";
import { getProjectConfigDirPath } from "@nexus/runtime/config/getProjectConfigDirPath.js";
import { getUserKeybindingsPath } from "@nexus/runtime/config/getUserKeybindingsPath.js";

/**
 * Returns the global and project keybinding file paths in precedence order.
 *
 * @param cwd Active project working directory.
 * @returns Candidate keybinding config paths.
 */
export function getTermKeybindingPaths(cwd: string): string[] {
  return [getUserKeybindingsPath(), join(getProjectConfigDirPath(cwd), "keybindings.json")];
}
