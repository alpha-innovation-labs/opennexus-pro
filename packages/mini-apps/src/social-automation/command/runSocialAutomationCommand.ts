import { hasMiniAppHelpFlag } from "../../shared/hasMiniAppHelpFlag.js";
import { createSocialAutomationUsageText } from "./createSocialAutomationUsageText.js";
import { runSocialAutomationStatusCommand } from "./status/runSocialAutomationStatusCommand.js";
import { runTwitterFetchCommand } from "./twitter/runTwitterFetchCommand.js";
import { runYoutubeFetchCommand } from "./youtube/runYoutubeFetchCommand.js";

/**
 * Executes the social automation mini-app command.
 *
 * @param argv Raw CLI args.
 * @returns Exit code for the command.
 */
export async function runSocialAutomationCommand(argv: readonly string[]): Promise<number> {
	if (hasMiniAppHelpFlag(argv)) {
		console.log(createSocialAutomationUsageText());
		return 0;
	}
	if (argv[1] === "twitter" && argv[2] === "fetch") return await runTwitterFetchCommand(argv);
	if (argv[1] === "youtube" && argv[2] === "fetch") return await runYoutubeFetchCommand(argv);
	if (argv[1] === "status") return runSocialAutomationStatusCommand(argv);
	console.log(createSocialAutomationUsageText());
	return 1;
}
