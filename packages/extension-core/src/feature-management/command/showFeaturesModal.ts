import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { getAllBundledExtensionIds, bundledFeatureFlags } from "@nexus/feature-flags/registry.js";
import { isRuntimeExtensionFeatureEnabled } from "@nexus/feature-flags/runtimeExtensionFeatureState.js";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { createFeatureStatusRows } from "../model/createFeatureStatusRows.js";
import { FeatureManagementModal } from "../ui/FeatureManagementModal.js";
import { updateFeatureStatusRow } from "../model/persistFeatureFlagOverride.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { createNexusPackageManager } from "../../pi-packages/package/createNexusPackageManager.js";
import { normalizeNpmPackageName } from "../../pi-packages/package/normalizeNpmPackageName.js";
import { getFeatureManagementGroup } from "../model/getFeatureManagementGroup.js";
import type { FeatureStatusRow } from "../model/types.js";
import { MINIMAL_EXTENSION_WHITELIST } from "@nexus/shared/minimal.js";

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
		staticConfig[id] = { enabled: true, features: bundledFeatureFlags[id]?.features ?? [] };
	}

	// Read user overrides so the modal reflects the real enabled/disabled state.
	const userConfig = readNexusUserConfig();
	const userOverrides: Record<string, boolean> = userConfig.featureFlags ?? {};
	const runtimeConfig: Record<string, { enabled: boolean; features: string[] }> = {};
	for (const id of allIds) {
		runtimeConfig[id] = {
			enabled: isRuntimeExtensionFeatureEnabled(id, userOverrides[id] === false ? false : true),
			features: bundledFeatureFlags[id]?.features ?? [],
		};
	}

	let rows = createFeatureStatusRows(
		{ extensions: staticConfig },
		{ extensions: runtimeConfig },
		MINIMAL_EXTENSION_WHITELIST,
	);

	// Append installed Pi packages as a dedicated section.
	const packageRuntime = createNexusPackageManager(ctx.cwd);
	const piPackages = packageRuntime.packageManager.listConfiguredPackages();
	const piPackageRows = piPackages.map((entry) => {
		const name = normalizeNpmPackageName(entry.source);
		const piPackagesMap = userConfig.extensions?.pi_packages ?? {};
		const enabled = piPackagesMap[entry.source] !== false && piPackagesMap[name] !== false;
		return {
			category: "core" as const,
			sourceCategory: "other" as const,
			extensionId: entry.source,
			feature: name,
			status: enabled ? "enabled" : "disabled",
			group: getFeatureManagementGroup(entry.source, MINIMAL_EXTENSION_WHITELIST),
		} satisfies FeatureStatusRow;
	});

	rows = [...rows, ...piPackageRows].sort((a, b) => {
		const groupDiff = (a.group ?? "").localeCompare(b.group ?? "");
		return groupDiff !== 0 ? groupDiff : a.feature.localeCompare(b.feature);
	});

	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) =>
			new FeatureManagementModal(
				theme,
				rows,
				done,
				(extensionId, patch, row) => {
					return updateFeatureStatusRow(extensionId, patch, row, MINIMAL_EXTENSION_WHITELIST);
				},
			),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%"),
		},
	);
}
