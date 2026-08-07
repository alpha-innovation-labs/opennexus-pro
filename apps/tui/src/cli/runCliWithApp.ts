import { getNexusAgentDirPath } from "@nexus/runtime/config/getNexusAgentDirPath.js";
import { findMiniAppCommand, findMiniAppRunnerCommand, getMiniAppManifests } from "@nexus/mini-apps/index.js";
import { hasHelpFlag } from "./help/hasHelpFlag.js";
import { printNexusUsage } from "./help/printNexusUsage.js";
import { hasObservationsFlag } from "./observations/hasObservationsFlag.js";
import { isObservationsCommand } from "./observations/isObservationsCommand.js";
import { printObservationsList } from "./observations/printObservationsList.js";
import { readObservationsSessionIdArg } from "./observations/readObservationsSessionIdArg.js";
import { runObservationsCommand } from "./observations/runObservationsCommand.js";
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
import { runPiPackagesCommand } from "./pi-packages/runPiPackagesCommand.js";
import { hasThemesFlag, hasThemesListFlag, hasThemesSetFlag, readThemeNameArg, readListThemeNameArg } from "./themes/hasThemesFlag.js";
import { printThemesHelp } from "./themes/printThemesHelp.js";
import { printThemesList } from "./themes/printThemesList.js";
import { setTheme } from "./themes/setTheme.js";
import { hasProvidersFlag } from "./providers/hasProvidersFlag.js";
import { runProvidersCommand } from "./providers/runProvidersCommand.js";

export interface RunCliWithAppOptions {
  runApp: (argv: string[]) => Promise<void>;
}

/**
 * Runs the Nexus CLI entrypoint with an injected app runner.
 *
 * CLI feature gating has been removed — all mini-app commands are
 * available. Mini-apps are controlled by the feature-flag registry
 * and user config.json overrides.
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

  if (isObservationsCommand(argv)) {
    getNexusAgentDirPath();
    return runObservationsCommand(argv, process.cwd(), readSessionDirArg(argv));
  }

  const miniAppManifests = getMiniAppManifests();
  const runnerMiniApp = findMiniAppRunnerCommand(miniAppManifests, argv);
  if (runnerMiniApp) {
    await runnerMiniApp.runRunner();
    return 0;
  }

  const commandMiniApp = findMiniAppCommand(miniAppManifests, argv);
  if (commandMiniApp) {
    return commandMiniApp.runCommand(argv);
  }

  const installExitCode = await runInstallCommand(argv);
  if (installExitCode !== undefined) return installExitCode;

  const uninstallExitCode = await runUninstallCommand(argv);
  if (uninstallExitCode !== undefined) return uninstallExitCode;

  const piPackagesExitCode = await runPiPackagesCommand(argv);
  if (piPackagesExitCode !== undefined) return piPackagesExitCode;

  if (hasHelpFlag(argv)) {
    printNexusUsage();
    return 0;
  }

  if (hasSessionsAllFlag(argv)) {
    getNexusAgentDirPath();
    if (hasJsonFlag(argv)) {
      await printAllSessionsJson();
    } else {
      await printAllSessionsTable();
    }
    return 0;
  }

  if (hasSessionsFlag(argv)) {
    getNexusAgentDirPath();
    if (hasJsonFlag(argv)) {
      await printSessionsJson(process.cwd(), readSessionDirArg(argv));
    } else {
      await printSessionsTable(process.cwd(), readSessionDirArg(argv));
    }
    return 0;
  }

  if (hasDeleteSessionFlag(argv)) {
    getNexusAgentDirPath();
    return runDeleteSessionCommand(argv, process.cwd(), readSessionDirArg(argv));
  }

  if (hasThemesSetFlag(argv)) {
    const themeName = readThemeNameArg(argv);
    if (!themeName) {
      console.error('Usage: nexus themes set <theme-name>');
      return 1;
    }
    return setTheme(themeName);
  }

  if (hasThemesListFlag(argv)) {
    return printThemesList(readListThemeNameArg(argv));
  }

  if (hasThemesFlag(argv)) {
    return printThemesHelp();
  }

  if (hasProvidersFlag(argv)) {
    return runProvidersCommand(argv);
  }

  if (hasObservationsFlag(argv)) {
    getNexusAgentDirPath();
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
