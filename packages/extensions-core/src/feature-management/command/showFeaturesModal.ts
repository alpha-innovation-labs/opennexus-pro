import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { getAllBundledExtensionIds } from "@nexus/feature-flags/registry.js";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { createFeatureStatusRows } from "../model/createFeatureStatusRows.js";
import { FeatureManagementModal } from "../ui/FeatureManagementModal.js";
import { updateFeatureStatusRow } from "../model/persistFeatureFlagOverride.js";

/**
 * Opens the feature management modal.
 *
 * @param ctx Extension command context.
 */
export async function showFeaturesModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) {
		ctx.ui.notify("/features requires an interactive UI session.", "warning");
		return;
	}

	// Initial load: all extensions from the registry, enabled by default.
	const allIds = getAllBundledExtensionIds();
	const staticConfig: Record<string, { enabled: boolean; features: string[] }> = {};
	for (const id of allIds) {
		staticConfig[id] = { enabled: true, features: [] };
	}

	let rows = createFeatureStatusRows(
		{ extensions: staticConfig },
		{ extensions: staticConfig },
	);

	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) =>
			new FeatureManagementModal(
				theme,
				rows,
				done,
				(extensionId, patch, row) => {
					return updateFeatureStatusRow(extensionId, patch, row);
				},
			),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%"),
		},
	);
}
