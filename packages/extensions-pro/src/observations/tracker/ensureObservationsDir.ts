import { mkdir } from "node:fs/promises";

/**
 * Ensures the observations directory exists.
 *
 * @param dir Directory path.
 */
export async function ensureObservationsDir(dir: string): Promise<void> {
	await mkdir(dir, { recursive: true });
}
