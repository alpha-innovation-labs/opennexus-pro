import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { getAllBundledExtensionIds } from "@nexus/feature-flags/registry.js";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { createFeatureStatusRows } from "../model/createFeatureStatusRows.js";
import { FeatureManagementModal } from "../ui/FeatureManagementModal.js";
import { updateFeatureStatusRow } from "../model/persistFeatureFlagOverride.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";

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

	// Build initial snapshot: all extensions from registry, default enabled.
	const allIds = getAllBundledExtensionIds();
	const staticConfig: Record<string, { enabled: boolean; features: string[] }> = {};
	for (const id of allIds) {
		staticConfig[id] = { enabled: true, features: [] };
	}

	// Read user overrides so the modal reflects the real enabled/disabled state.
	const userConfig = readNexusUserConfig();
	const userOverrides: Record<string, boolean> = userConfig.featureFlags ?? {};
	const runtimeConfig: Record<string, { enabled: boolean; features: string[] }> = {};
	for (const id of allIds) {
		runtimeConfig[id] = {
			enabled: userOverrides[id] === false ? false : true,
			features: [],
		};
	}

	let rows = createFeatureStatusRows(
		{ extensions: staticConfig },
		{ extensions: runtimeConfig },
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
