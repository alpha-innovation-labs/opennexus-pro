import { mkdir, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CMUX_ENV_LOCK_PATH = join(tmpdir(), "nexus-cmux-env-lock");

/**
 * Serializes tests that mutate shared cmux environment variables.
 *
 * @param run Test body that needs exclusive access to cmux env vars.
 * @returns Result returned by the test body.
 */
export async function withLockedCmuxEnv<T>(run: () => Promise<T>): Promise<T> {
	for (;;) {
		try {
			await mkdir(CMUX_ENV_LOCK_PATH);
			break;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
			await new Promise((resolve) => setTimeout(resolve, 25));
		}
	}

	try {
		return await run();
	} finally {
		await rmdir(CMUX_ENV_LOCK_PATH);
	}
}
