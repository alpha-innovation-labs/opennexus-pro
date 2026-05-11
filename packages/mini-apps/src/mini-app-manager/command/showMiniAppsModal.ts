import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { applyUserExtensionConfig } from "@nexus/feature-flags/applyUserExtensionConfig.js";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { readFeatureFlagsConfig } from "@nexus/feature-flags/readFeatureFlagsConfig.js";
import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import { PiPackagesModal } from "@nexus/extensions/pi-packages/ui/PiPackagesModal.js";
import { updateManagedExtensionRows } from "@nexus/extensions/pi-packages/model/updateManagedExtensionRows.js";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { setUserExtensionEnabled } from "@nexus/runtime/config/setUserExtensionEnabled.js";
import { createManagedMiniAppRows } from "../model/createManagedMiniAppRows.js";

/**
 * Opens the mini-app manager modal.
 *
 * @param ctx Extension command context.
 */
export async function showMiniAppsModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) {
		ctx.ui.notify("/mini-apps requires an interactive UI session.", "warning");
		return;
	}

	let rows = createManagedMiniAppRows(readMiniAppFeatureFlagsConfig());

	/**
	 * Persists a mini-app enabled state and returns refreshed rows.
	 *
	 * @param miniAppId Mini-app id to update.
	 * @param enabled Whether the mini-app is enabled.
	 * @returns Updated rows.
	 */
	function updateMiniApp(miniAppId: string, enabled: boolean) {
		setUserExtensionEnabled(miniAppId, enabled);
		rows = updateManagedExtensionRows(rows, miniAppId, enabled ? "enabled" : "disabled");
		return rows;
	}

	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) => new PiPackagesModal(theme, rows, done, updateMiniApp, "Mini-Apps", "all"),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%") as never,
		},
	);
}

/**
 * Reads source feature flags when available and falls back to compiled release flags.
 *
 * @returns User-preference-adjusted feature flag config.
 */
function readMiniAppFeatureFlagsConfig(): FeatureFlagsConfig {
	try {
		return applyUserExtensionConfig(readFeatureFlagsConfig());
	} catch {
		return applyUserExtensionConfig(getBundledFeatureFlagsConfig());
	}
}
