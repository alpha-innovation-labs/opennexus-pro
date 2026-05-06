/**
 * Nexus mini-app registration contract used by the CLI entrypoint.
 */
export type MiniAppManifest = {
	id: string;
	label: string;
	features: string[];
	isCommand: (argv: readonly string[]) => boolean;
	isRunnerCommand: (argv: readonly string[]) => boolean;
	runCommand: (argv: readonly string[]) => Promise<number>;
	runRunner: () => Promise<void>;
};
