import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runStartupHeroSession } from "./runStartupHeroSession.js";

/**
 * Captures the initial interactive terminal output for a fresh startup session.
 *
 * @param columns Terminal width.
 * @param rows Terminal height.
 * @param timeoutMs Max runtime before forced termination.
 * @returns Captured terminal output.
 */
export async function captureStartupOutput(columns: number, rows: number, timeoutMs: number): Promise<string> {
	const cwd = process.cwd();
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);

	try {
		return await runStartupHeroSession(cwd, env, columns, rows, timeoutMs);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
}
