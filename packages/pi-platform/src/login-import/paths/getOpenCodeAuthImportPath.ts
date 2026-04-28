import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Returns the fixed OpenCode auth file path used as an import source.
 *
 * @returns Absolute path to OpenCode's auth.json.
 */
export function getOpenCodeAuthImportPath(): string {
	return join(process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share"), "opencode", "auth.json");
}
