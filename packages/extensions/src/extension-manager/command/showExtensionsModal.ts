import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { removeUserExtensionConfig } from "@nexus/runtime/config/removeUserExtensionConfig.js";
import { setUserExtensionEnabled } from "@nexus/runtime/config/setUserExtensionEnabled.js";
import { createPanelOverlayOptions } from "../../overlay/createPanelOverlayOptions.js";
import { createManagedExtensionRows } from "../model/createManagedExtensionRows.js";
import { updateManagedExtensionRows } from "../model/updateManagedExtensionRows.js";
import { createNexusPackageManager } from "../package/createNexusPackageManager.js";
import { fetchNpmPackageSearchRows } from "../package/fetchNpmPackageSearchRows.js";
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

	const packageRuntime = createNexusPackageManager(ctx.cwd);
	const readRows = () => createManagedExtensionRows(getBundledFeatureFlagsConfig(), readNexusUserConfig(), packageRuntime.packageManager.listConfiguredPackages());
	let rows = readRows();

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

	/** Installs a third-party package and refreshes rows. */
	async function installPackage(source: string) {
		await packageRuntime.packageManager.installAndPersist(source);
		await packageRuntime.settingsManager.flush();
		ctx.ui.notify(`Installed ${source}. Restart Nexus to load it.`, "info");
		rows = readRows();
		return rows;
	}

	/** Removes a third-party package or stale extension preference and refreshes rows. */
	async function removePackage(source: string) {
		const removedPackage = await packageRuntime.packageManager.removeAndPersist(source);
		const removedExtensionConfig = removedPackage ? false : removeUserExtensionConfig(source);
		await packageRuntime.settingsManager.flush();
		ctx.ui.notify(removedPackage || removedExtensionConfig ? `Removed ${source}. Restart Nexus to unload it.` : `No configured package or extension matched ${source}.`, removedPackage || removedExtensionConfig ? "info" : "warning");
		rows = readRows();
		return rows;
	}

	/** Updates a third-party package and refreshes rows. */
	async function updatePackage(source: string) {
		await packageRuntime.packageManager.update(source);
		ctx.ui.notify(`Updated ${source}. Restart Nexus to reload it.`, "info");
		rows = readRows();
		return rows;
	}

	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) => new ExtensionManagerModal(theme, rows, done, {
			onUpdate: updateExtension,
			onInstallPackage: installPackage,
			onRemovePackage: removePackage,
			onUpdatePackage: updatePackage,
			onSearchPackages: async (query, currentRows) => fetchNpmPackageSearchRows(query, new Set(currentRows.map((row) => row.source).filter((source): source is string => !!source))),
		}),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%") as never,
		},
	);
}
