import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig";
import { normalizeNpmPackageName } from "../package/normalizeNpmPackageName";
import { removeUserExtensionConfig } from "@nexus/runtime/config/removeUserExtensionConfig";
import { setUserExtensionEnabled } from "@nexus/runtime/config/setUserExtensionEnabled";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import { createThirdPartyManagedExtensionRows } from "../model/createThirdPartyManagedExtensionRows";
import { updateManagedExtensionRows } from "../model/updateManagedExtensionRows";
import { createNexusPackageManager } from "../package/createNexusPackageManager";
import { fetchNpmPackageSearchRows } from "../package/fetchNpmPackageSearchRows";
import { PiPackagesModal } from "../ui/PiPackagesModal";

/**
 * Opens the installed Pi packages modal.
 *
 * @param ctx Extension command context.
 */
export async function showPiPackagesModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) {
		ctx.ui.notify("/pi-packages requires an interactive UI session.", "warning");
		return;
	}

	const packageRuntime = createNexusPackageManager(ctx.cwd);
	const readRows = () => createThirdPartyManagedExtensionRows(readNexusUserConfig(), packageRuntime.packageManager.listConfiguredPackages());
	let rows = readRows();

	/**
	 * Persists a user extension preference and returns refreshed rows.
	 *
	 * @param extensionId Extension id to update.
	 * @param enabled Whether the extension is enabled.
	 * @returns Updated rows.
	 */
	function updateExtension(extensionId: string, enabled: boolean) {
		// Resolve the original source (e.g. "npm:pi-chrome") from the normalized ID.
		const packages = packageRuntime.packageManager.listConfiguredPackages();
		const matchingPackage = packages.find(
			(p) => normalizeNpmPackageName(p.source) === extensionId,
		);
		const sourceToWrite = matchingPackage ? matchingPackage.source : extensionId;
		setUserExtensionEnabled(sourceToWrite, enabled);
		rows = updateManagedExtensionRows(rows, extensionId, enabled ? "enabled" : "disabled");
		return rows;
	}

	/** Installs a third-party package and refreshes rows. */
	async function installPackage(source: string) {
		// Use packageManager.install() (disk-only) instead of installAndPersist()
		// because Nexus manages config via extensions.pi_packages, not packages array.
		await packageRuntime.packageManager.install(source);
		setUserExtensionEnabled(source, true);
		ctx.ui.notify(`Installed ${source}. Restart Nexus to load it.`, "info");
		rows = readRows();
		return rows;
	}

	/** Removes a third-party package or stale extension preference and refreshes rows. */
	async function removePackage(source: string) {
		// Use packageManager.remove() (disk-only) instead of removeAndPersist()
		// because Nexus manages config via extensions.pi_packages, not packages array.
		await packageRuntime.packageManager.remove(source);
		const removedExtensionConfig = removeUserExtensionConfig(source);
		ctx.ui.notify(removedExtensionConfig ? `Removed ${source}. Restart Nexus to unload it.` : `No configured package or extension matched ${source}.`, removedExtensionConfig ? "info" : "warning");
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
		(_tui, theme, _keybindings, done) => new PiPackagesModal(theme, rows, done, {
			onUpdate: updateExtension,
			onInstallPackage: installPackage,
			onRemovePackage: removePackage,
			onUpdatePackage: updatePackage,
			onSearchPackages: async (query, currentRows) => fetchNpmPackageSearchRows(query, new Set(currentRows.map((row) => row.source).filter((source): source is string => !!source))),
		}, "Pi Packages"),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%") as never,
		},
	);
}
