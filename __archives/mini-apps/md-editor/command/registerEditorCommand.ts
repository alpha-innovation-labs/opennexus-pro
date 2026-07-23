import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@nexus/extensions/slash-menu/withSlashMenuGroup.js";
import { showMdEditorModal } from "../modal/showMdEditorModal.js";

/**
 * Registers the /editor command for the hardcoded demo.md Markdown editor.
 */
export function registerEditorCommand(pi: ExtensionAPI): void {
	pi.registerCommand("editor", withSlashMenuGroup({
		description: "Open the md-editor Markdown line chat for demo.md",
		handler: async (_args, ctx) => {
			await showMdEditorModal(ctx);
		},
	}, "Mini-Apps"));
}
