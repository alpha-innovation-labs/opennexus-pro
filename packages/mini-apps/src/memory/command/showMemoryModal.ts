import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/extensions/overlay/createPanelOverlayOptions.js";
import { commitMemoryOperation } from "../git/commitMemoryOperation.js";
import { ensureMemoryGitRepository } from "../git/ensureMemoryGitRepository.js";
import { MemoryModal } from "../modal/MemoryModal.js";
import { resolveMemoryRoot } from "../settings/resolveMemoryRoot.js";
import { deleteMemoryFile } from "../storage/deleteMemoryFile.js";
import { listMemoryItems } from "../storage/listMemoryItems.js";

/**
 * Opens the Nexus memory browser modal.
 *
 * @param ctx Extension command context.
 */
export async function showMemoryModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) return;
	const root = await resolveMemoryRoot();
	await ensureMemoryGitRepository(root);
	const items = await listMemoryItems(root);
	await ctx.ui.custom<undefined>((_tui, theme, _keybindings, done) => new MemoryModal(theme, items, done, async (item) => {
		await deleteMemoryFile(item.path, root);
		await commitMemoryOperation(root, `Delete memory ${item.relativePath}`);
		ctx.ui.notify(`Deleted ${item.relativePath}`, "info");
	}), {
		overlay: true,
		overlayOptions: createPanelOverlayOptions(1, "100%"),
	});
}
