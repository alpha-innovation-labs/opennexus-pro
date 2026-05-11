import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { sendNotifyMessage } from "./runtime/sendNotifyMessage.js";

/**
 * Registers desktop notifications for completed agent runs.
 *
 * @param pi Pi extension API.
 */
export function registerNotifyExtension(pi: ExtensionAPI): void {
	pi.on("agent_end", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		sendNotifyMessage("Nexus", "Ready for input");
	});
}
