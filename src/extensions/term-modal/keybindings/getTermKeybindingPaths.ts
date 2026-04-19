import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Returns the global and project keybinding file paths in precedence order.
 *
 * @param cwd Active project working directory.
 * @returns Candidate keybinding config paths.
 */
export function getTermKeybindingPaths(cwd: string): string[] {
	return [join(homedir(), ".pi", "agent", "keybindings.json"), join(cwd, ".pi", "keybindings.json")];
}
