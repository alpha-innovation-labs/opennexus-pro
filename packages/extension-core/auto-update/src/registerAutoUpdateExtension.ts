import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { checkForNexusUpdate } from "./runtime/checkForNexusUpdate";

/**
 * Registers the auto-update extension.
 *
 * @param pi Pi extension API.
 */
export function registerAutoUpdateExtension(pi: ExtensionAPI): void {
	pi.on("session_start", (event, ctx) => {
		if (event.reason !== "startup") return;
		void checkForNexusUpdate(pi, ctx);
	});
}
