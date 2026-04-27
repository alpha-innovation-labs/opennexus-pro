import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { clearStartupLogo } from "./clearStartupLogo.js";
import { shouldShowStartupLogo } from "./shouldShowStartupLogo.js";
import { showStartupLogo } from "./showStartupLogo.js";

/**
 * Registers the startup logo widget for fresh sessions.
 *
 * @param pi Pi extension API.
 */
export function registerStartupLogoExtension(pi: ExtensionAPI): void {
	pi.on("session_start", (event, ctx) => {
		if (!ctx.hasUI || !shouldShowStartupLogo(event.reason, process.argv)) {
			clearStartupLogo(ctx);
			return;
		}
		showStartupLogo(ctx);
	});
	pi.on("turn_start", (_event, ctx) => {
		if (!ctx.hasUI) return;
		clearStartupLogo(ctx);
	});
	pi.on("session_shutdown", (_event, ctx) => {
		if (!ctx.hasUI) return;
		clearStartupLogo(ctx);
	});
}
