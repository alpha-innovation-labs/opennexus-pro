import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isNewerVersion } from "../model/isNewerVersion.js";
import { fetchLatestNpmVersion } from "../registry/fetchLatestNpmVersion.js";
import { showAutoUpdateModal } from "../ui/showAutoUpdateModal.js";
import { currentPackageInfo } from "./currentPackageInfo.js";
import { installNexusUpdate } from "./installNexusUpdate.js";

/**
 * Returns true when the error looks like a network or offline failure.
 *
 * @param error The caught error to classify.
 * @returns True if the error is a network/offline failure.
 */
export function isNetworkError(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	const lower = message.toLowerCase();
	return (
		lower.includes("fetch failed") ||
		lower.includes("networkerror") ||
		lower.includes("net::err") ||
		lower.includes("enotfound") ||
		lower.includes("econnrefused") ||
		lower.includes("getaddrinfo") ||
		lower.includes("network")
	);
}

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
		if (isNetworkError(error)) return; // silently skip when offline
		const message = error instanceof Error ? error.message : String(error);
		ctx.ui.notify(`Nexus update check failed: ${message}`, "warning");
	}
}
