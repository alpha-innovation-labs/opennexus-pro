import { getNexusAgentDirPath } from "@nexus/runtime";
import { setUserExtensionEnabled } from "@nexus/runtime";
import { createNexusCliPackageManager } from "./createNexusCliPackageManager";
import { normalizeInstallSource } from "./normalizeInstallSource";
import { parseInstallCommand } from "./parseInstallCommand";
import { printInstallUsage } from "./printInstallUsage";

/**
 * Runs the Nexus package install command when argv targets it.
 *
 * @param argv Raw CLI arguments.
 * @returns Exit code when handled, otherwise undefined.
 */
export async function runInstallCommand(
	argv: readonly string[],
): Promise<number | undefined> {
	const options = parseInstallCommand(argv);
	if (!options) return undefined;
	if (options.help) {
		printInstallUsage();
		return 0;
	}
	if (options.invalidOption) {
		console.error(`Unknown option ${options.invalidOption} for "install".`);
		console.error("Usage: nexus install <source> [-l]");
		return 1;
	}
	if (options.invalidArgument) {
		console.error(`Unexpected argument ${options.invalidArgument}.`);
		console.error("Usage: nexus install <source> [-l]");
		return 1;
	}
	if (!options.source) {
		console.error("Missing install source.");
		console.error("Usage: nexus install <source> [-l]");
		return 1;
	}

	getNexusAgentDirPath();
	const source = normalizeInstallSource(options.source);
	// Keep a package manager only for the npm install step (downloading the package),
	// but do NOT call installAndPersist — that writes to the legacy `packages` array.
	const runtime = createNexusCliPackageManager(process.cwd());
	runtime.packageManager.setProgressCallback((event) => {
		if (event.type === "start") process.stdout.write(`${event.message}\n`);
	});

	try {
		// Install the npm package to disk without persisting to settings
		await runtime.packageManager.install(source, { local: options.local });
		// Persist only via Nexus's own config: extensions.pi_packages
		setUserExtensionEnabled(source, true);
		console.log(`Installed ${source}`);
		console.log("Restart Nexus to load it.");
		return 0;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown install error";
		console.error(`Error: ${message}`);
		return 1;
	}
}
