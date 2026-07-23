import { runGatewayDaemon } from "../core/runner/runGatewayDaemon.js";
import { GATEWAY_RUNNER_COMMAND } from "../core/shared/constants.js";
import type { MiniAppManifest } from "../../registry/MiniAppManifest.js";
import { runGatewayCommand } from "./runGatewayCommand.js";

/**
 * Social chat mini-app manifest consumed by Nexus CLI routing.
 */
export const socialChatMiniAppManifest: MiniAppManifest = {
	id: "social-chat",
	label: "Social Chat",
	features: ["nexus social-chat CLI commands", "background social adapter daemon"],
	isCommand: (argv) => argv[0] === "social-chat",
	isRunnerCommand: (argv) => argv[0] === "social-chat" && argv[1] === GATEWAY_RUNNER_COMMAND,
	runCommand: runGatewayCommand,
	runRunner: runGatewayDaemon,
};
