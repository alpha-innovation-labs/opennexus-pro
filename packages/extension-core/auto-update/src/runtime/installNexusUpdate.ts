import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createUpdateInstallArgs } from "./createUpdateInstallArgs.js";

/**
 * Installs the latest Nexus npm package after explicit user confirmation.
 *
 * @param pi Extension API used to execute npm.
 * @param ctx Extension context used for notifications and cwd.
 * @param packageName npm package name to install.
 */
export async function installNexusUpdate(pi: ExtensionAPI, ctx: ExtensionContext, packageName: string): Promise<void> {
	ctx.ui.notify("Installing Nexus update…", "info");
	const result = await pi.exec("npm", createUpdateInstallArgs(packageName), { cwd: ctx.cwd, timeout: 300000 });
	if (result.code !== 0) {
		ctx.ui.notify(`Nexus update failed: ${result.stderr.trim() || `npm exited ${result.code}`}`, "error");
		return;
	}
	ctx.ui.notify("Nexus updated. Restart Nexus to use the new version.", "info");
}
