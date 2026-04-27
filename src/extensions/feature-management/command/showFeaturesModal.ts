import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { applySystemExtensionAvailability } from "../../../feature-flags/applySystemExtensionAvailability.js";
import type { FeatureFlagsConfig } from "../../../feature-flags/types.js";
import { createFeatureStatusRows } from "../model/createFeatureStatusRows.js";
import { FeatureManagementModal } from "../ui/FeatureManagementModal.js";

/**
 * Opens the feature management modal for the current feature-flag config.
 *
 * @param ctx Extension command context.
 * @param readConfig Config provider for source or compiled runtimes.
 */
export async function showFeaturesModal(
	ctx: ExtensionCommandContext,
	readConfig: () => FeatureFlagsConfig,
): Promise<void> {
	if (!ctx.hasUI) {
		ctx.ui.notify("/features requires an interactive UI session.", "warning");
		return;
	}

	const config = readConfig();
	const rows = createFeatureStatusRows(config, applySystemExtensionAvailability(config));
	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) => new FeatureManagementModal(theme, rows, done),
		{
			overlay: true,
			overlayOptions: {
				anchor: "center",
				width: "80%",
				minWidth: 80,
				maxHeight: "85%",
			},
		},
	);
}
