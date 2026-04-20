import { rm } from "node:fs/promises";

/**
 * Removes a temporary fake cmux executable directory.
 *
 * @param directoryPath Temporary directory path.
 */
export async function removeFakeCmuxExecutable(directoryPath: string): Promise<void> {
	await rm(directoryPath, { force: true, recursive: true });
}
