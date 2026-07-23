import type { MiniAppManifest } from "../../registry/MiniAppManifest.js";
import { runAutomationsDaemon } from "../core/daemon/runAutomationsDaemon.js";
import { AUTOMATIONS_COMMAND, AUTOMATIONS_DAEMON_RUNNER_COMMAND } from "../core/shared/constants.js";
import { runAutomationsCommand } from "./runAutomationsCommand.js";

/**
 * Automations mini-app manifest consumed by Nexus CLI routing.
 */
export const automationsMiniAppManifest: MiniAppManifest = {
	id: "automations",
	label: "Automations",
	features: ["nexus automations CLI commands", "scheduled prompt automation daemon"],
	isCommand: (argv) => argv[0] === AUTOMATIONS_COMMAND,
	isRunnerCommand: (argv) => argv[0] === AUTOMATIONS_COMMAND && argv[1] === AUTOMATIONS_DAEMON_RUNNER_COMMAND,
	runCommand: runAutomationsCommand,
	runRunner: runAutomationsDaemon,
};
