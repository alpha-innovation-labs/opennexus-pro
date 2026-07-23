import type { MiniAppManifest } from "../../registry/MiniAppManifest.js";
import { runSocialAutomationCommand } from "./runSocialAutomationCommand.js";

export const SOCIAL_AUTOMATION_COMMAND = "social-automation";

/** Social automation mini-app manifest consumed by Nexus CLI routing. */
export const socialAutomationMiniAppManifest: MiniAppManifest = {
	id: SOCIAL_AUTOMATION_COMMAND,
	label: "Social Automation",
	features: ["nexus social-automation CLI commands", "Nitter RSS ingestion", "YouTube RSS ingestion", "yt-dlp audio preparation"],
	isCommand: (argv) => argv[0] === SOCIAL_AUTOMATION_COMMAND,
	isRunnerCommand: () => false,
	runCommand: runSocialAutomationCommand,
	runRunner: async () => undefined,
};
