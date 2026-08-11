import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Reads the extracted embedded package version marker.
 *
 * @param rootDir Extraction root directory.
 * @returns Extracted asset version or undefined.
 */
export async function readEmbeddedPackageVersion(
	rootDir: string,
): Promise<string | undefined> {
	try {
		return (
			(await readFile(join(rootDir, ".version"), "utf8")).trim() || undefined
		);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return undefined;
		}
		throw error;
	}
}
