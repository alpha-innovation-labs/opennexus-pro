import * as os from "node:os";
import * as path from "node:path";

/**
 * Resolves the subagents extension config file path.
 *
 * @returns Absolute config file path.
 */
export function getSubagentConfigPath(): string {
	return path.join(os.homedir(), ".pi", "agent", "extensions", "subagent", "config.json");
}
