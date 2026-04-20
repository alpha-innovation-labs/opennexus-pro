import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

/**
 * Builds the per-parent-session directory root used by subagent runs.
 *
 * @param parentSessionFile Parent Pi session file path.
 * @returns The base directory for subagent session files.
 */
export function getSubagentSessionRoot(parentSessionFile: string | null): string {
	if (parentSessionFile) {
		const baseName = path.basename(parentSessionFile, ".jsonl");
		const sessionsDir = path.dirname(parentSessionFile);
		return path.join(sessionsDir, baseName);
	}

	return fs.mkdtempSync(path.join(os.tmpdir(), "pi-subagent-session-"));
}
