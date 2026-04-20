import { mkdir, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const NOTIFY_ENV_LOCK_PATH = join(tmpdir(), "nexus-notify-env-lock");

/**
 * Serializes tests that mutate shared desktop notification environment variables.
 *
 * @param run Test body requiring exclusive notify env access.
 * @returns Result returned by the test body.
 */
export async function withLockedNotifyEnv<T>(run: () => Promise<T>): Promise<T> {
	for (;;) {
		try {
			await mkdir(NOTIFY_ENV_LOCK_PATH);
			break;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
			await new Promise((resolve) => setTimeout(resolve, 25));
		}
	}
	try {
		return await run();
	} finally {
		await rmdir(NOTIFY_ENV_LOCK_PATH);
	}
}
