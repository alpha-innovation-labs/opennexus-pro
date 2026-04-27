import { ensureAgentDirEnv } from "@nexus/runtime/config/ensureAgentDirEnv.js";
import { runGatewayDaemon } from "@nexus/gateway-core/runner/runGatewayDaemon.js";
import { isGatewayCommand } from "./gateway/isGatewayCommand.js";
import { isGatewayRunnerCommand } from "./gateway/isGatewayRunnerCommand.js";
import { runGatewayCommand } from "./gateway/runGatewayCommand.js";
import { hasHelpFlag } from "./help/hasHelpFlag.js";
import { printNexusUsage } from "./help/printNexusUsage.js";
import { hasSessionsFlag } from "./sessions/hasSessionsFlag.js";
import { printSessionsTable } from "./sessions/printSessionsTable.js";
import { readSessionDirArg } from "./sessions/readSessionDirArg.js";
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

  if (isGatewayCommand(argv)) {
    return runGatewayCommand(argv);
  }

  if (hasHelpFlag(argv)) {
    printNexusUsage();
    return 0;
  }

  if (hasSessionsFlag(argv)) {
    ensureAgentDirEnv();
    await printSessionsTable(process.cwd(), readSessionDirArg(argv));
    return 0;
  }

  await options.runApp(argv);
  return 0;
}
