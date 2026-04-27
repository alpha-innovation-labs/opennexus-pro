import { formatGatewayStatus } from "@nexus/gateway-core/commands/formatGatewayStatus.js";
import { getGatewayStatus } from "@nexus/gateway-core/commands/getGatewayStatus.js";
import { restartGateway } from "@nexus/gateway-core/commands/restartGateway.js";
import { startGateway } from "@nexus/gateway-core/commands/startGateway.js";
import { stopGateway } from "@nexus/gateway-core/commands/stopGateway.js";
import { hasHelpFlag } from "../help/hasHelpFlag.js";
import { formatGatewayRestartMessage } from "./formatGatewayRestartMessage.js";
import { formatGatewayStartMessage } from "./formatGatewayStartMessage.js";
import { formatGatewayStopMessage } from "./formatGatewayStopMessage.js";
import { printGatewayUsage } from "./printGatewayUsage.js";

/**
 * Executes a user-facing gateway command.
 *
 * @param argv Raw gateway CLI args.
 * @returns Exit code for the command.
 */
export async function runGatewayCommand(argv: readonly string[]): Promise<number> {
	const command = argv[1];
	if (hasHelpFlag(argv)) {
		printGatewayUsage();
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
		case "status": {
			console.log(formatGatewayStatus(await getGatewayStatus()));
			return 0;
		}
		default:
			printGatewayUsage();
			return 1;
	}
}
