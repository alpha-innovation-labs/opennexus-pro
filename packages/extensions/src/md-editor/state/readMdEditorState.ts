import { readFile } from "node:fs/promises";
import { getMdEditorStatePath } from "./getMdEditorStatePath.js";

export type MdEditorPersistedState = {
	selectedLineNumber: number;
	focus: "left-panel" | "right-chat";
};

/**
 * Reads the last md-editor line and focus state for the current project.
 */
export async function readMdEditorState(sessionDir: string): Promise<MdEditorPersistedState> {
	try {
		return JSON.parse(await readFile(await getMdEditorStatePath(sessionDir), "utf8")) as MdEditorPersistedState;
	} catch {
		return { selectedLineNumber: 1, focus: "left-panel" };
	}
}
