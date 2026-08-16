import { parseFactoryArgs } from "./parseFactoryArgs";
import { runFactoryExplain } from "./runFactoryExplain";
import { runFactoryList } from "./runFactoryList";

/**
 * Runs the factory CLI command.
 *
 * Usage:
 *   nexus factory list              — List available factories
 *   nexus factory explain           — Explain how to create a factory
 *
 * On startup, ensures the local `.factory/` directory exists.
 *
 * @param argv Raw CLI arguments.
 * @returns Process exit code.
 */
export async function runFactoryCommand(
	argv: readonly string[],
): Promise<number> {
	const parsed = parseFactoryArgs(argv);

	switch (parsed.command) {
		case "list": {
			return runFactoryList();
		}

		case "explain": {
			return runFactoryExplain();
		}

		case "help": {
			const invalid =
				"invalidSubcommand" in parsed
					? parsed.invalidSubcommand
					: null;
			if (invalid) {
				console.error(`Unknown subcommand "${invalid}" for "factory".`);
			}
			console.log(`
factory — Manage workflow factories.

Usage:
  nexus factory list              List available factories
  nexus factory explain           Explain how to create a factory

On startup, factory ensures the local .factory/ directory exists.
`);
			return 0;
		}

		default: {
			return 0;
		}
	}
}
