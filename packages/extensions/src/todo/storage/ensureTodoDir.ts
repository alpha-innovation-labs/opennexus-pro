import { mkdir } from "node:fs/promises";

/**
 * Ensures the todo storage directory exists.
 *
 * @param dir Todo directory path.
 */
export async function ensureTodoDir(dir: string): Promise<void> {
	await mkdir(dir, { recursive: true });
}
