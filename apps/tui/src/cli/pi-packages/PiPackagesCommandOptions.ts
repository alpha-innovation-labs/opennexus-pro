/**
 * Options parsed from nexus pi-packages subcommands.
 */
export type PiPackagesCommandOptions = {
	/** Package source or name (for enable/disable). */
	source?: string;
	/** Subcommand: list, enable, disable. */
	subcommand?: string;
	/** Whether --help was requested. */
	help: boolean;
	/** Unknown option flag, if any. */
	invalidOption?: string;
	/** Extra argument, if any. */
	invalidArgument?: string;
};
