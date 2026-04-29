import { ensureAgentDirEnv } from "@nexus/runtime/config/ensureAgentDirEnv.js";
import { runAnnotationsDaemon } from "@nexus/annotations-daemon-core/runner/runAnnotationsDaemon.js";
import { runGatewayDaemon } from "@nexus/gateway-core/runner/runGatewayDaemon.js";
import { isAnnotationCommand } from "./annotation/isAnnotationCommand.js";
import { runAnnotationCommand } from "./annotation/runAnnotationCommand.js";
import { isGatewayCommand } from "./gateway/isGatewayCommand.js";
import { isGatewayRunnerCommand } from "./gateway/isGatewayRunnerCommand.js";
import { runGatewayCommand } from "./gateway/runGatewayCommand.js";
import { isAnnotationsDaemonRunnerCommand } from "./annotations-daemon/isAnnotationsDaemonRunnerCommand.js";
import { isCliFeatureAvailable } from "./features/isCliFeatureAvailable.js";
import { printUnavailableCliFeature } from "./features/printUnavailableCliFeature.js";
import { hasHelpFlag } from "./help/hasHelpFlag.js";
import { printNexusUsage } from "./help/printNexusUsage.js";
import { hasObservationsFlag } from "./observations/hasObservationsFlag.js";
import { printObservationsList } from "./observations/printObservationsList.js";
import { readObservationsSessionIdArg } from "./observations/readObservationsSessionIdArg.js";
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
    if (!isCliFeatureAvailable("gateway")) {
      printUnavailableCliFeature("gateway");
      return 1;
    }
    await runGatewayDaemon();
    return 0;
  }

  if (isAnnotationsDaemonRunnerCommand(argv)) {
    if (!isCliFeatureAvailable("annotation")) {
      printUnavailableCliFeature("annotation");
      return 1;
    }
    await runAnnotationsDaemon();
    return 0;
  }

  if (isGatewayCommand(argv)) {
    if (!isCliFeatureAvailable("gateway")) {
      printUnavailableCliFeature("gateway");
      return 1;
    }
    return runGatewayCommand(argv);
  }

  if (isAnnotationCommand(argv)) {
    if (!isCliFeatureAvailable("annotation")) {
      printUnavailableCliFeature("annotation");
      return 1;
    }
    return runAnnotationCommand(argv);
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

  if (hasObservationsFlag(argv)) {
    ensureAgentDirEnv();
    const sessionId = readObservationsSessionIdArg(argv);
    if (!sessionId) {
      console.error("Usage: nexus --observations <session-id>");
      return 1;
    }
    await printObservationsList(sessionId, process.cwd());
    return 0;
  }

  await options.runApp(argv);
  return 0;
}
