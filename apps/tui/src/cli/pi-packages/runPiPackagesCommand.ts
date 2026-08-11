import { createNexusPackageManager } from "@extensions/pi-packages/package/createNexusPackageManager";
import { normalizeNpmPackageName } from "@extensions/pi-packages/package/normalizeNpmPackageName";
import { applyNexusConfigPatch } from "@nexus/runtime/config/applyNexusConfigPatch";
import { getNexusAgentDirPath } from "@nexus/runtime/config/getNexusAgentDirPath";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig";
import { setUserExtensionEnabled } from "@nexus/runtime/config/setUserExtensionEnabled";
import { Table } from "console-table-printer";
import { parsePiPackagesCommand } from "./parsePiPackagesCommand";
import { printPiPackagesUsage } from "./printPiPackagesUsage";

/**
 * Runs the Nexus pi-packages CLI when argv targets it.
 *
 * Subcommands: list, enable, disable.
 *
 * @param argv Raw CLI arguments.
 * @returns Exit code when handled, otherwise undefined.
 */
export async function runPiPackagesCommand(
	argv: readonly string[],
): Promise<number | undefined> {
	const options = parsePiPackagesCommand(argv);
	if (!options) return undefined;
	if (options.help) {
		printPiPackagesUsage();
		return 0;
	}
	if (options.invalidOption) {
		console.error(`Unknown option ${options.invalidOption} for "pi-packages".`);
		console.error("Usage: nexus pi-packages <subcommand> [args]");
		return 1;
	}
	if (options.invalidArgument) {
		console.error(`Unexpected argument ${options.invalidArgument}.`);
		console.error("Usage: nexus pi-packages <subcommand> [args]");
		return 1;
	}

	const subcommand = options.subcommand;
	if (!subcommand) {
		printPiPackagesUsage();
		return 0;
	}

	getNexusAgentDirPath();
	await applyNexusConfigPatch();

	if (subcommand === "list") {
		return runListCommand();
	}

	if (subcommand === "enable" || subcommand === "disable") {
		return runToggleCommand(subcommand, options);
	}

	console.error(`Unknown subcommand: ${subcommand}`);
	printPiPackagesUsage();
	return 1;
}

/**
 * Lists all configured Pi packages with their enabled status.
 *
 * @returns Exit code.
 */
async function runListCommand(): Promise<number> {
	const packageRuntime = createNexusPackageManager(process.cwd());
	const packages = packageRuntime.packageManager.listConfiguredPackages();

	if (packages.length === 0) {
		console.log("No Pi packages configured.");
		return 0;
	}

	const userConfig = readNexusUserConfig();
	const piPackages = userConfig.extensions?.pi_packages ?? {};

	const rows = packages.map((entry) => {
		const name = normalizeNpmPackageName(entry.source);
		const enabled =
			piPackages[entry.source] !== false && piPackages[name] !== false;
		return { name, source: entry.source, enabled, scope: entry.scope };
	});

	const tableData = rows.map((row) => ({
		Package: row.name,
		Status: row.enabled ? "enabled" : "disabled",
		Source: `${row.source}${row.scope === "project" ? " [project]" : ""}`,
	}));

	const ct = new Table({
		columns: [
			{ name: "Package", alignment: "left" },
			{ name: "Status", alignment: "left" },
			{ name: "Source", alignment: "left" },
		],
	});
	ct.addRows(tableData);
	ct.printTable();

	return 0;
}

/**
 * Enables or disables a single Pi package.
 *
 * @param action Subcommand: "enable" or "disable".
 * @param options Parsed CLI options.
 * @returns Exit code.
 */
async function runToggleCommand(
	action: string,
	options: { source?: string },
): Promise<number> {
	const sourceInput = options.source;
	if (!sourceInput) {
		console.error(`Missing package source for "${action}".`);
		console.error(`Usage: nexus pi-packages ${action} <source>`);
		return 1;
	}

	const source = `npm:${sourceInput.startsWith("npm:") ? sourceInput.slice(4) : sourceInput}`;

	try {
		setUserExtensionEnabled(source, action === "enable");
		console.log(
			`${action === "enable" ? "Enabled" : "Disabled"} ${source}. Restart Nexus to apply.`,
		);
		return 0;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error(`Error: ${message}`);
		return 1;
	}
}
