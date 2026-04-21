import { runApp } from "../runtime/runApp.js";
import { runGatewayDaemon } from "../gateway/runner/runGatewayDaemon.js";
import { isAdapterCommand } from "./adapter/isAdapterCommand.js";
import { isGatewayRunnerCommand } from "./adapter/isGatewayRunnerCommand.js";
import { runAdapterCommand } from "./adapter/runAdapterCommand.js";

/**
 * Runs the Nexus CLI entrypoint.
 *
 * @param argv Raw process arguments.
 * @returns Process exit code.
 */
export async function runCli(argv: string[]): Promise<number> {
  if (isGatewayRunnerCommand(argv)) {
    await runGatewayDaemon();
    return 0;
  }

  if (isAdapterCommand(argv)) {
    return runAdapterCommand(argv);
  }

  await runApp(argv);
  return 0;
}
