import { getCurrentNexusLaunchSpec } from "@nexus/runtime/cli/getCurrentNexusLaunchSpec.js";
import { AUTOMATIONS_COMMAND, AUTOMATIONS_DAEMON_RUNNER_COMMAND } from "../shared/constants.js";

/**
 * Resolves how the current Nexus install relaunches the automation daemon.
 *
 * @returns Launch command and arguments.
 */
export function getAutomationLaunchSpec(): { command: string; args: string[] } {
	return getCurrentNexusLaunchSpec([AUTOMATIONS_COMMAND, AUTOMATIONS_DAEMON_RUNNER_COMMAND]);
}
