import { runGatewayDaemon } from "../gateway/runner/runGatewayDaemon.js";
import { isAdapterCommand } from "./adapter/isAdapterCommand.js";
import { isGatewayRunnerCommand } from "./adapter/isGatewayRunnerCommand.js";
import { runAdapterCommand } from "./adapter/runAdapterCommand.js";
import { hasVersionFlag } from "./version/hasVersionFlag.js";
import { printAppVersion } from "./version/printAppVersion.js";

export interface RunCliWithAppOptions {
  runApp: (argv: string[]) => Promise<void>;
}

/**
 * Runs the Nexus CLI entrypoint with an injected app runner.
 *
 * @param argv Raw process arguments.
 * @param options Runtime behavior for the current launch mode.
 * @returns Process exit code.
 */
export async function runCliWithApp(argv: string[], options: RunCliWithAppOptions): Promise<number> {
  if (hasVersionFlag(argv)) {
    await printAppVersion();
    return 0;
  }

  if (isGatewayRunnerCommand(argv)) {
    await runGatewayDaemon();
    return 0;
  }

  if (isAdapterCommand(argv)) {
    return runAdapterCommand(argv);
  }

  await options.runApp(argv);
  return 0;
}
