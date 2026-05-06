import { getCurrentNexusLaunchSpec } from "@nexus/runtime/cli/getCurrentNexusLaunchSpec.js";
import type { NexusLaunchSpec } from "@nexus/runtime/cli/types.js";
import { getNexusCliWrapperPath } from "./getNexusCliWrapperPath.js";

/**
 * Creates a Nexus launch spec suitable for cmux restoration.
 *
 * @param args Nexus CLI args to pass on restore.
 * @returns Launch spec using the npm wrapper when available.
 */
export function createNexusRestoreLaunchSpec(args: string[]): NexusLaunchSpec {
	const wrapperPath = getNexusCliWrapperPath();
	if (wrapperPath) return { command: wrapperPath, args };
	return getCurrentNexusLaunchSpec(args);
}
