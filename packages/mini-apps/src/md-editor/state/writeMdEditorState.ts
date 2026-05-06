import { writeFile } from "node:fs/promises";
import { getMdEditorStatePath } from "./getMdEditorStatePath.js";
import type { MdEditorPersistedState } from "./readMdEditorState.js";

/**
 * Saves the last md-editor line and focus state for the current project.
 */
export async function writeMdEditorState(sessionDir: string, state: MdEditorPersistedState): Promise<void> {
	await writeFile(await getMdEditorStatePath(sessionDir), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
