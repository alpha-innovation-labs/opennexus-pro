import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Returns the global editor-trigger config file path.
 *
 * @returns Absolute global config file path.
 */
export function getGlobalEditorTriggerConfigPath(): string {
	const agentDir = process.env.PI_CODING_AGENT_DIR ?? join(homedir(), ".pi", "agent");
	return join(agentDir, "editor-triggers.json");
}
