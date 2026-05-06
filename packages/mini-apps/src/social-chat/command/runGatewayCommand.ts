import { formatGatewayStatus } from "../core/commands/formatGatewayStatus.js";
import { getGatewayStatus } from "../core/commands/getGatewayStatus.js";
import { restartGateway } from "../core/commands/restartGateway.js";
import { startGateway } from "../core/commands/startGateway.js";
import { stopGateway } from "../core/commands/stopGateway.js";
import { hasMiniAppHelpFlag } from "../../cli/hasMiniAppHelpFlag.js";
import { createGatewayUsageText } from "./createGatewayUsageText.js";
import { formatGatewayRestartMessage } from "./formatGatewayRestartMessage.js";
import { formatGatewayStartMessage } from "./formatGatewayStartMessage.js";
import { formatGatewayStopMessage } from "./formatGatewayStopMessage.js";

/**
 * Executes the gateway mini-app command.
 *
 * @param argv Raw gateway CLI args.
 * @returns Exit code for the command.
 */
export async function runGatewayCommand(argv: readonly string[]): Promise<number> {
	const command = argv[1];
	if (hasMiniAppHelpFlag(argv)) {
		console.log(createGatewayUsageText());
		return 0;
	}

	switch (command) {
		case "start": {
			const result = await startGateway();
			console.log(formatGatewayStartMessage(result.started));
			console.log(formatGatewayStatus(result.status));
			return 0;
		}
		case "stop": {
			const result = await stopGateway();
			console.log(formatGatewayStopMessage(result.stopped));
			console.log(formatGatewayStatus(result.status));
			return 0;
		}
		case "restart": {
			const result = await restartGateway();
			console.log(formatGatewayRestartMessage(result.restarted));
			console.log(formatGatewayStatus(result.status));
			return 0;
		}
		case "status":
			console.log(formatGatewayStatus(await getGatewayStatus()));
			return 0;
		default:
			console.log(createGatewayUsageText());
			return 1;
	}
}
