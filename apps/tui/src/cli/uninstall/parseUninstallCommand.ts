import { isUninstallCommand } from "./isUninstallCommand";
import type { UninstallCommandOptions } from "./UninstallCommandOptions";

/**
 * Parses Nexus uninstall command options.
 *
 * @param argv Raw CLI arguments.
 * @returns Parsed uninstall options, or undefined for another command.
 */
export function parseUninstallCommand(
	argv: readonly string[],
): UninstallCommandOptions | undefined {
	if (!isUninstallCommand(argv)) return undefined;

	let source: string | undefined;
	let local = false;
	let help = false;
	let invalidOption: string | undefined;
	let invalidArgument: string | undefined;

	for (const arg of argv.slice(1)) {
		if (arg === "-h" || arg === "--help") {
			help = true;
			continue;
		}
		if (arg === "-l" || arg === "--local") {
			local = true;
			continue;
		}
		if (arg.startsWith("-")) {
			invalidOption ??= arg;
			continue;
		}
		if (!source) {
			source = arg;
			continue;
		}
		invalidArgument ??= arg;
	}

	return { source, local, help, invalidOption, invalidArgument };
}
