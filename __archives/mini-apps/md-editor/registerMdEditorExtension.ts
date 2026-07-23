import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerEditorCommand } from "./command/registerEditorCommand.js";

/**
 * Registers all md-editor extension surfaces.
 */
export function registerMdEditorExtension(pi: ExtensionAPI): void {
	registerEditorCommand(pi);
}
