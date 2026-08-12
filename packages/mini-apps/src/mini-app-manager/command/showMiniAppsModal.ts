import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { updateManagedExtensionRows } from "@extensions/pi-packages";
import { PiPackagesModal } from "@extensions/pi-packages";
import { createPanelOverlayOptions } from "@nexus/tui-kit";
import { getAllBundledMiniAppIds } from "../../registry/bundledMiniAppIds";
import type {
	FeatureFlagConfig,
	FeatureFlagsConfig,
} from "../../registry/featureFlagsTypes";
import { createManagedMiniAppRows } from "../model/createManagedMiniAppRows";

/**
 * Opens the mini-app manager modal.
 *
 * In the new system, mini-apps are listed from the hardcoded registry.
 * Users can enable/disable them via config.json.
 *
 * @param ctx Extension command context.
 */
export async function showMiniAppsModal(
	ctx: ExtensionCommandContext,
): Promise<void> {
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
		rows = updateManagedExtensionRows(
			rows,
			miniAppId,
			enabled ? "enabled" : "disabled",
		);
		return rows;
	}

	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) =>
			new PiPackagesModal(theme, rows, done, updateMiniApp, "Mini-Apps", "all"),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%") as never,
		},
	);
}

/**
 * Reads the hardcoded registry for mini-app entries.
 *
 * @returns Feature flag config containing mini-app entries from the registry.
 */
function readMiniAppFeatureFlagsConfig(): FeatureFlagsConfig {
	const allIds = getAllBundledMiniAppIds();
	const knownMiniApps = new Set(["tetris"]);
	const miniAppEntries: Record<string, FeatureFlagConfig> = {};
	for (const id of allIds) {
		if (!knownMiniApps.has(id)) continue;
		miniAppEntries[id] = { enabled: true, features: [], category: "mini-app" };
	}
	return { extensions: miniAppEntries };
}
