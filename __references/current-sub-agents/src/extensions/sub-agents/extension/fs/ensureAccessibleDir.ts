import * as fs from "node:fs";

/**
 * Creates a directory and retries once if the first access check fails.
 *
 * @param dirPath Directory path.
 */
export function ensureAccessibleDir(dirPath: string): void {
	fs.mkdirSync(dirPath, { recursive: true });

	try {
		fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
		return;
	} catch {
		try {
			fs.rmSync(dirPath, { recursive: true, force: true });
		} catch {
			// Best-effort cleanup before retry.
		}
	}

	fs.mkdirSync(dirPath, { recursive: true });
	fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
}
