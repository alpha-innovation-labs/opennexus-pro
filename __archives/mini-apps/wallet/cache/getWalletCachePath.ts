import { join } from "node:path";

/**
 * Returns the wallet balance cache path under the Nexus user directory.
 *
 * @param env Environment variables used to locate the home directory.
 * @returns Absolute cache file path.
 */
export function getWalletCachePath(env: NodeJS.ProcessEnv): string {
	const home = env.NEXUS_HOME?.trim() || env.HOME?.trim();
	if (!home) throw new Error("Unable to locate a home directory for wallet cache storage.");
	return join(home, ".nexus", "wallet-cache.json");
}
