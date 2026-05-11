import { APP_NAME } from "@nexus/pi-platform/config.js";

const AGENT_LABEL_ENV_VAR = "NEXUS_AGENT_LABEL";

/**
 * Resolves the assistant footer label.
 *
 * Prefers a Nexus-specific environment override so development runs can display
 * a different label without mutating Pi's global app name.
 *
 * @returns Visible assistant label.
 */
export function getAgentLabel(): string {
	return process.env[AGENT_LABEL_ENV_VAR]?.trim() || APP_NAME.charAt(0).toUpperCase() + APP_NAME.slice(1);
}
