import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { isNewerVersion } from "../model/isNewerVersion.js";
import { fetchLatestNpmVersion } from "../registry/fetchLatestNpmVersion.js";
import { showAutoUpdateModal } from "../ui/showAutoUpdateModal.js";
import { currentPackageInfo } from "./currentPackageInfo.js";
import { installNexusUpdate } from "./installNexusUpdate.js";

/**
 * Checks npm for a newer Nexus version and prompts the user without blocking startup.
 *
 * @param pi Extension API used for installing an approved update.
 * @param ctx Extension context used for UI and notifications.
 */
export async function checkForNexusUpdate(pi: ExtensionAPI, ctx: ExtensionContext): Promise<void> {
	const current = currentPackageInfo();
	if (!ctx.hasUI || current.version === "unknown") return;
	try {
		const latestVersion = await fetchLatestNpmVersion(current.name);
		if (!isNewerVersion(current.version, latestVersion)) return;
		const approved = await showAutoUpdateModal(ctx, {
			currentVersion: current.version,
			latestVersion,
			packageName: current.name,
		});
		if (approved) await installNexusUpdate(pi, ctx, current.name);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		ctx.ui.notify(`Nexus update check failed: ${message}`, "warning");
	}
}
