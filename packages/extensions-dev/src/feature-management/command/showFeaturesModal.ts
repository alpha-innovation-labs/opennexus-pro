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

	const config = createFeatureFlagsConfig();
	let rows = createFeatureStatusRows(config, config);

	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) =>
			new FeatureManagementModal(
				theme,
				rows,
				done,
				(extensionId, patch, row) => {
					rows = updateFeatureStatusRow(extensionId, patch, row);
					return rows;
				},
			),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%"),
		},
	);
}

/**
 * Builds a minimal FeatureFlagsConfig from the hardcoded registry.
 *
 * @returns Feature flag config for the features modal.
 */
function createFeatureFlagsConfig(): { extensions: Record<string, { enabled: boolean; features: string[] }> } {
	const allIds = getAllBundledExtensionIds();
	const extensions: Record<string, { enabled: boolean; features: string[] }> = {};
	for (const id of allIds) {
		extensions[id] = { enabled: true, features: [] };
	}
	return { extensions };
}
