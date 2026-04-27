import { STARTUP_PROFILE_ARG } from "@nexus/observability/startup-profile/constants.js";

/**
 * Extracts the Nexus startup profiling flag from argv.
 *
 * @param argv Raw process arguments.
 * @returns Cleaned args plus startup-profile enablement.
 */
export function extractStartupProfileArgs(argv: string[]): { args: string[]; startupProfileEnabled: boolean } {
	let startupProfileEnabled = false;
	const args = argv.filter((value) => {
		if (value !== STARTUP_PROFILE_ARG) return true;
		startupProfileEnabled = true;
		return false;
	});
	return { args, startupProfileEnabled };
}
