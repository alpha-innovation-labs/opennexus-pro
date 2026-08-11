import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { createProjectKey } from "./createProjectKey";

/**
 * Returns project-scoped database paths for the bundled FFF runtime.
 *
 * @param projectRoot Project root path.
 * @returns Runtime storage paths.
 */
export function getRuntimePaths(projectRoot: string): {
	rootDir: string;
	dbDir: string;
	frecencyDbPath: string;
	historyDbPath: string;
} {
	const rootDir = join(getAgentDir(), "fff");
	const dbDir = join(rootDir, createProjectKey(projectRoot));
	return {
		rootDir,
		dbDir,
		frecencyDbPath: join(dbDir, "frecency.db"),
		historyDbPath: join(dbDir, "history.db"),
	};
}
