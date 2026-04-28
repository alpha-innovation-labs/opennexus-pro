import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Returns the fixed upstream Pi auth file path used as an import source.
 *
 * @returns Absolute path to Pi's auth.json.
 */
export function getPiAuthImportPath(): string {
	return join(homedir(), ".pi", "agent", "auth.json");
}
