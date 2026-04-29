import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import { writeFeatureFlagsConfig } from "@nexus/feature-flags/writeFeatureFlagsConfig.js";
import { createPanelOverlayOptions } from "../../overlay/createPanelOverlayOptions.js";
import { createFeatureStatusRows } from "../model/createFeatureStatusRows.js";
import { updateFeatureFlagsConfig, type FeatureFlagConfigPatch } from "../model/updateFeatureFlagsConfig.js";
import { FeatureManagementModal } from "../ui/FeatureManagementModal.js";

/**
 * Opens the feature management modal for the current feature-flag config.
 *
 * @param ctx Extension command context.
 * @param readConfig Config provider for source or compiled runtimes.
 * @param writeConfig Config persistence hook.
 */
export async function showFeaturesModal(
	ctx: ExtensionCommandContext,
	readConfig: () => FeatureFlagsConfig,
	writeConfig: (config: FeatureFlagsConfig) => void = writeFeatureFlagsConfig,
): Promise<void> {
	if (!ctx.hasUI) {
		ctx.ui.notify("/features requires an interactive UI session.", "warning");
		return;
	}

	let config = readConfig();

	/**
	 * Creates rows from the latest in-memory config.
	 *
	 * @returns Current feature-management rows.
	 */
	function createRows() {
		return createFeatureStatusRows(config, applySystemExtensionAvailability(config));
	}

	/**
	 * Persists a modal edit and returns refreshed rows.
	 *
	 * @param extensionId Extension id to update.
	 * @param patch Feature flag patch to apply.
	 * @returns Refreshed feature-management rows.
	 */
	function updateConfig(extensionId: string, patch: FeatureFlagConfigPatch, row: { category: "extensions" | "other" }) {
		config = updateFeatureFlagsConfig(config, extensionId, patch, row.category);
		writeConfig(config);
		return createRows();
	}

	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) => new FeatureManagementModal(theme, createRows(), done, updateConfig),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%"),
		},
	);
}
