import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";

/**
 * Resolves the default persisted session directory for a working directory.
 *
 * @param cwd Working directory used by Pi/Nexus session storage.
 * @returns Default session directory path.
 */
export function getDefaultDeleteSessionDir(cwd: string): string {
	const safePath = `--${cwd.replace(/^[\\/]/, "").replace(/[\\/:]/g, "-")}--`;
	return join(getAgentDir(), "sessions", safePath);
}
