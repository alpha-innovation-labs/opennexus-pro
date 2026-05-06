import { mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Returns the project-local md-editor UI state file path.
 */
export async function getMdEditorStatePath(sessionDir: string): Promise<string> {
	const dir = path.join(path.dirname(sessionDir), "md-editor-state");
	await mkdir(dir, { recursive: true });
	return path.join(dir, `${path.basename(sessionDir)}.json`);
}
