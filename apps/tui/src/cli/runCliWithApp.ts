import { ensureAgentDirEnv } from "@nexus/runtime/config/ensureAgentDirEnv.js";
import { findMiniAppCommand, findMiniAppRunnerCommand, getMiniAppManifests } from "@nexus/mini-apps/index.js";
import { isCliFeatureAvailable } from "./features/isCliFeatureAvailable.js";
import { printUnavailableCliFeature } from "./features/printUnavailableCliFeature.js";
import { hasHelpFlag } from "./help/hasHelpFlag.js";
import { printNexusUsage } from "./help/printNexusUsage.js";
import { hasObservationsFlag } from "./observations/hasObservationsFlag.js";
import { hasObservationsLocationFlag } from "./observations/hasObservationsLocationFlag.js";
import { printObservationsList } from "./observations/printObservationsList.js";
import { printObservationsLocation } from "./observations/printObservationsLocation.js";
import { readObservationsSessionIdArg } from "./observations/readObservationsSessionIdArg.js";
import { runInstallCommand } from "./install/runInstallCommand.js";
import { runUninstallCommand } from "./uninstall/runUninstallCommand.js";
import { hasJsonFlag } from "./sessions/hasJsonFlag.js";
import { hasSessionsAllFlag } from "./sessions/hasSessionsAllFlag.js";
import { hasSessionsFlag } from "./sessions/hasSessionsFlag.js";
import { printAllSessionsJson } from "./sessions/printAllSessionsJson.js";
import { printAllSessionsTable } from "./sessions/printAllSessionsTable.js";
import { printSessionsJson } from "./sessions/printSessionsJson.js";
import { printSessionsTable } from "./sessions/printSessionsTable.js";
import { readSessionDirArg } from "./sessions/readSessionDirArg.js";
import { hasVersionFlag } from "./version/hasVersionFlag.js";
import { printAppVersion } from "./version/printAppVersion.js";
import { hasDeleteSessionFlag } from "./delete-session/hasDeleteSessionFlag.js";
import { runDeleteSessionCommand } from "./delete-session/runDeleteSessionCommand.js";
import { hasChatStatusFileLocationFlag } from "./chat-status/hasChatStatusFileLocationFlag.js";
import { printChatStatusFileLocation } from "./chat-status/printChatStatusFileLocation.js";

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

  if (hasChatStatusFileLocationFlag(argv)) {
    printChatStatusFileLocation();
    return 0;
  }

  if (hasObservationsLocationFlag(argv)) {
    printObservationsLocation();
    return 0;
  }

  const miniAppManifests = getMiniAppManifests();
  const runnerMiniApp = findMiniAppRunnerCommand(miniAppManifests, argv);
  if (runnerMiniApp) {
    if (!isCliFeatureAvailable(runnerMiniApp.id)) {
      printUnavailableCliFeature(runnerMiniApp.id);
      return 1;
    }
    await runnerMiniApp.runRunner();
    return 0;
  }

  const commandMiniApp = findMiniAppCommand(miniAppManifests, argv);
  if (commandMiniApp) {
    if (!isCliFeatureAvailable(commandMiniApp.id)) {
      printUnavailableCliFeature(commandMiniApp.id);
      return 1;
    }
    return commandMiniApp.runCommand(argv);
  }

  const installExitCode = await runInstallCommand(argv);
  if (installExitCode !== undefined) return installExitCode;

  const uninstallExitCode = await runUninstallCommand(argv);
  if (uninstallExitCode !== undefined) return uninstallExitCode;

  if (hasHelpFlag(argv)) {
    printNexusUsage();
    return 0;
  }

  if (hasSessionsAllFlag(argv)) {
    ensureAgentDirEnv();
    if (hasJsonFlag(argv)) {
      await printAllSessionsJson();
    } else {
      await printAllSessionsTable();
    }
    return 0;
  }

  if (hasSessionsFlag(argv)) {
    ensureAgentDirEnv();
    if (hasJsonFlag(argv)) {
      await printSessionsJson(process.cwd(), readSessionDirArg(argv));
    } else {
      await printSessionsTable(process.cwd(), readSessionDirArg(argv));
    }
    return 0;
  }

  if (hasDeleteSessionFlag(argv)) {
    ensureAgentDirEnv();
    return runDeleteSessionCommand(argv, process.cwd(), readSessionDirArg(argv));
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
