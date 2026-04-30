import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { setUserExtensionEnabled } from "@nexus/runtime/config/setUserExtensionEnabled.js";
import { createPanelOverlayOptions } from "../../overlay/createPanelOverlayOptions.js";
import { createManagedExtensionRows } from "../model/createManagedExtensionRows.js";
import { updateManagedExtensionRows } from "../model/updateManagedExtensionRows.js";
import { ExtensionManagerModal } from "../ui/ExtensionManagerModal.js";

/**
 * Opens the installed extension manager modal.
 *
 * @param ctx Extension command context.
 */
export async function showExtensionsModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) {
		ctx.ui.notify("/extensions requires an interactive UI session.", "warning");
		return;
	}

	let rows = createManagedExtensionRows(getBundledFeatureFlagsConfig(), readNexusUserConfig());

	/**
	 * Persists a user extension preference and returns refreshed rows.
	 *
	 * @param extensionId Extension id to update.
	 * @param enabled Whether the extension is enabled.
	 * @returns Updated rows.
	 */
	function updateExtension(extensionId: string, enabled: boolean) {
		setUserExtensionEnabled(extensionId, enabled);
		rows = updateManagedExtensionRows(rows, extensionId, enabled ? "enabled" : "disabled");
		return rows;
	}

	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) => new ExtensionManagerModal(theme, rows, done, updateExtension),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%") as never,
		},
	);
}
