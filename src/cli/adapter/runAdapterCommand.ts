import { formatGatewayStatus } from "../../gateway/commands/formatGatewayStatus.js";
import { getGatewayStatus } from "../../gateway/commands/getGatewayStatus.js";
import { restartGateway } from "../../gateway/commands/restartGateway.js";
import { startGateway } from "../../gateway/commands/startGateway.js";
import { stopGateway } from "../../gateway/commands/stopGateway.js";
import { printAdapterUsage } from "./printAdapterUsage.js";

/**
 * Executes a user-facing adapter gateway command.
 *
 * @param argv Raw adapter CLI args.
 * @returns Exit code for the command.
 */
export async function runAdapterCommand(argv: string[]): Promise<number> {
  const command = argv[1];

  switch (command) {
    case "start": {
      const result = await startGateway();
      console.log(result.started ? "adapter gateway started" : "adapter gateway already running");
      console.log(formatGatewayStatus(result.status));
      return 0;
    }
    case "stop": {
      const result = await stopGateway();
      console.log(result.stopped ? "adapter gateway stopped" : "adapter gateway already stopped");
      console.log(formatGatewayStatus(result.status));
      return 0;
    }
    case "restart": {
      const result = await restartGateway();
      console.log(result.restarted ? "adapter gateway restarted" : "adapter gateway restart failed");
      console.log(formatGatewayStatus(result.status));
      return 0;
    }
    case "status": {
      console.log(formatGatewayStatus(await getGatewayStatus()));
      return 0;
    }
    default:
      printAdapterUsage();
      return 1;
  }
}
