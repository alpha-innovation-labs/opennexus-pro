import { readMdEditorState } from "../state/readMdEditorState.js";

/**
 * Loads the initial selected line and focus for the md-editor modal.
 */
export async function createMdEditorInitialState(sessionDir: string): Promise<{ selectedLineNumber: number; focus: "left-panel" | "right-chat" }> {
	return readMdEditorState(sessionDir);
}
