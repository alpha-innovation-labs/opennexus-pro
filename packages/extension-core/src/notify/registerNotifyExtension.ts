import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { sendNotifyMessage } from "./runtime/sendNotifyMessage.js";

/**
 * Registers desktop notifications for completed agent runs.
 *
 * @param pi Pi extension API.
 */
export function registerNotifyExtension(pi: ExtensionAPI): void {
	pi.on("agent_end", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		if (!readNexusUserConfig().notifyEnabled) return;
		sendNotifyMessage("Nexus", "Ready for input");
	});
}
