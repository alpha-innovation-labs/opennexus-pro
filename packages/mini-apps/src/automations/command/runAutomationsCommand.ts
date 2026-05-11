import { hasMiniAppHelpFlag } from "../../shared/hasMiniAppHelpFlag.js";
import { getAutomationsStatus } from "../core/commands/getAutomationsStatus.js";
import { startAutomations } from "../core/commands/startAutomations.js";
import { stopAutomations } from "../core/commands/stopAutomations.js";
import { createAutomationsUsageText } from "./createAutomationsUsageText.js";
import { formatAutomationsStatus } from "./formatAutomationsStatus.js";
import { runCreateAutomationCommand } from "./runCreateAutomationCommand.js";
import { runDeleteAutomationCommand } from "./runDeleteAutomationCommand.js";
import { runEditAutomationCommand } from "./runEditAutomationCommand.js";
import { runListAutomationsCommand } from "./runListAutomationsCommand.js";
import { runTemplatesCommand } from "./runTemplatesCommand.js";

/**
 * Executes the automations mini-app command.
 *
 * @param argv Raw CLI args.
 * @returns Exit code for the command.
 */
export async function runAutomationsCommand(argv: readonly string[]): Promise<number> {
	if (hasMiniAppHelpFlag(argv)) {
		console.log(createAutomationsUsageText());
		return 0;
	}
	switch (argv[1]) {
		case "start":
			console.log((await startAutomations()).started ? "Started automations daemon." : "Automations daemon is already running.");
			console.log(formatAutomationsStatus(getAutomationsStatus()));
			return 0;
		case "stop":
			console.log((await stopAutomations()).stopped ? "Stopped automations daemon." : "Automations daemon is not running.");
			console.log(formatAutomationsStatus(getAutomationsStatus()));
			return 0;
		case "status":
			console.log(formatAutomationsStatus(getAutomationsStatus()));
			return 0;
		case "list":
			return runListAutomationsCommand();
		case "create":
			return runCreateAutomationCommand(argv);
		case "edit":
			return runEditAutomationCommand(argv);
		case "delete":
			return runDeleteAutomationCommand(argv);
		case "templates":
			return runTemplatesCommand(argv);
		default:
			console.log(createAutomationsUsageText());
			return 1;
	}
}
