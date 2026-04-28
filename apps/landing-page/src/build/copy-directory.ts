import { cp } from "node:fs/promises";

/**
 * Copies a directory recursively into another directory.
 *
 * @param sourceDir Directory to copy from.
 * @param targetDir Directory to copy into.
 * @returns Promise that resolves after the copy completes.
 */
export async function copyDirectory(sourceDir: string, targetDir: string): Promise<void> {
  await cp(sourceDir, targetDir, { recursive: true });
}
