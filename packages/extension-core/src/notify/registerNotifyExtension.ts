import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { sendNotifyMessage } from "./runtime/sendNotifyMessage.js";

/**
 * Registers desktop notifications for completed agent runs.
 *
 * In the new system, notify is enabled by default in the hardcoded registry.
 * Users can disable it via config.json under `featureFlags.notify.enabled = false`.
 * The registration function itself does not check `notifyEnabled` — that's
 * handled by the feature-flag system.
 *
 * @param pi Pi extension API.
 */
export function registerNotifyExtension(pi: ExtensionAPI): void {
	pi.on("agent_end", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		sendNotifyMessage("Nexus", "Ready for input");
	});
}
