import {
	findMiniAppCommand,
	findMiniAppRunnerCommand,
	getMiniAppManifests,
} from "@nexus/mini-apps";
import { getNexusAgentDirPath } from "@nexus/runtime";
import { hasDeleteSessionFlag } from "./delete-session/hasDeleteSessionFlag";
import { runDeleteSessionCommand } from "./delete-session/runDeleteSessionCommand";
import {
	hasMinimalFlag,
	MINIMAL_EXTENSION_WHITELIST,
} from "./extensions/hasMinimalFlag";
import {
	hasFeaturesOverrideFlag,
	readDisabledFeatures,
	readEnabledFeatures,
} from "./features/hasFeaturesFlag";
import { hasHelpFlag } from "./help/hasHelpFlag";
import { printNexusUsage } from "./help/printNexusUsage";
import { runInstallCommand } from "./install/runInstallCommand";
import { hasObservationsFlag } from "./observations/hasObservationsFlag";
import { isObservationsCommand } from "./observations/isObservationsCommand";
import { printObservationsList } from "./observations/printObservationsList";
import { readObservationsSessionIdArg } from "./observations/readObservationsSessionIdArg";
import { runObservationsCommand } from "./observations/runObservationsCommand";
import { runPiPackagesCommand } from "./pi-packages/runPiPackagesCommand";
import { hasProvidersFlag } from "./providers/hasProvidersFlag";
import { runProvidersCommand } from "./providers/runProvidersCommand";
import { hasJsonFlag } from "./sessions/hasJsonFlag";
import { hasSessionsAllFlag } from "./sessions/hasSessionsAllFlag";
import { hasSessionsFlag } from "./sessions/hasSessionsFlag";
import { printAllSessionsJson } from "./sessions/printAllSessionsJson";
import { printAllSessionsTable } from "./sessions/printAllSessionsTable";
import { printSessionsJson } from "./sessions/printSessionsJson";
import { printSessionsTable } from "./sessions/printSessionsTable";
import { readSessionDirArg } from "./sessions/readSessionDirArg";
import { hasSubagentFlag } from "./subagent/hasSubagentFlag";
import { runSubagentCommand } from "./subagent/runSubagentCommand";
import {
	hasThemesFlag,
	hasThemesListFlag,
	hasThemesSetFlag,
	readListThemeNameArg,
	readThemeNameArg,
} from "./themes/hasThemesFlag";
import { printThemesHelp } from "./themes/printThemesHelp";
import { printThemesList } from "./themes/printThemesList";
import { setTheme } from "./themes/setTheme";
import { runUninstallCommand } from "./uninstall/runUninstallCommand";
import { hasVersionFlag } from "./version/hasVersionFlag";
import { printAppVersion } from "./version/printAppVersion";

export interface RunCliWithAppOptions {
	runApp: (
		argv: string[],
		options?: { disabledFeatures?: string[]; enabledFeatures?: string[] },
	) => Promise<void>;
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
export async function runCliWithApp(
	argv: string[],
	options: RunCliWithAppOptions,
): Promise<number> {
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

	// --minimal: disable pi-packages CLI entirely.
	if (!hasMinimalFlag(argv)) {
		const piPackagesExitCode = await runPiPackagesCommand(argv);
		if (piPackagesExitCode !== undefined) return piPackagesExitCode;
	}

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
		return runDeleteSessionCommand(
			argv,
			process.cwd(),
			readSessionDirArg(argv),
		);
	}

	if (hasThemesSetFlag(argv)) {
		const themeName = readThemeNameArg(argv);
		if (!themeName) {
			console.error("Usage: nexus themes set <theme-name>");
			return 1;
		}
		return setTheme(themeName);
	}

	if (hasThemesListFlag(argv)) {
		await printThemesList(readListThemeNameArg(argv));
		return 0;
	}

	if (hasThemesFlag(argv)) {
		printThemesHelp();
		return 0;
	}

	if (hasProvidersFlag(argv)) {
		return runProvidersCommand(argv);
	}

	if (hasSubagentFlag(argv)) {
		return runSubagentCommand();
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

	// Collect CLI-level feature overrides before starting the app.
	const disabledFeatures = readDisabledFeatures(argv);
	const enabledFeatures = readEnabledFeatures(argv);

	// --minimal: whitelist only the specified extensions, disable everything else.
	if (hasMinimalFlag(argv)) {
		const { getAllBundledExtensionIds } = await import(
			"@nexus/feature-flags"
		);
		const allIds = getAllBundledExtensionIds();
		const disabledFeatures = allIds.filter(
			(id) => !MINIMAL_EXTENSION_WHITELIST.includes(id),
		);
		await options.runApp(argv, {
			disabledFeatures,
			enabledFeatures: MINIMAL_EXTENSION_WHITELIST,
		});
		return 0;
	}

	if (hasFeaturesOverrideFlag(argv)) {
		const { getAllBundledExtensionIds } = await import(
			"@nexus/feature-flags"
		);
		const validIds = new Set(getAllBundledExtensionIds());
		const invalidDisabled = disabledFeatures.filter((id) => !validIds.has(id));
		const invalidEnabled = enabledFeatures.filter((id) => !validIds.has(id));
		const allInvalid = [...new Set([...invalidDisabled, ...invalidEnabled])];
		if (allInvalid.length > 0) {
			const validList = getAllBundledExtensionIds().join(", ");
			console.error(`Error: unknown feature(s): ${allInvalid.join(", ")}`);
			console.error(`Valid features: ${validList}`);
			return 1;
		}
		await options.runApp(argv, { disabledFeatures, enabledFeatures });
		return 0;
	}

	await options.runApp(argv);
	return 0;
}
