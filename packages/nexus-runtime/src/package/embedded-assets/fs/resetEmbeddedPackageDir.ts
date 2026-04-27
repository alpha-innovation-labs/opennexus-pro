import { mkdir, rm } from "node:fs/promises";

/**
 * Recreates the embedded package directory from scratch.
 *
 * @param dirPath Directory to reset.
 * @returns A promise that resolves after reset.
 */
export async function resetEmbeddedPackageDir(dirPath: string): Promise<void> {
  await rm(dirPath, { force: true, recursive: true });
  await mkdir(dirPath, { recursive: true });
}
