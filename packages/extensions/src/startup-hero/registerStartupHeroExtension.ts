import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { clearStartupHero } from "./clearStartupHero.js";
import { shouldShowStartupHero } from "./shouldShowStartupHero.js";
import { showStartupHero } from "./showStartupHero.js";

/**
 * Registers the startup hero widget for fresh sessions.
 *
 * @param pi Pi extension API.
 */
export function registerStartupHeroExtension(pi: ExtensionAPI): void {
	pi.on("session_start", (event, ctx) => {
		if (!ctx.hasUI || !shouldShowStartupHero(event.reason, process.argv)) {
			clearStartupHero(ctx);
			return;
		}
		showStartupHero(ctx);
	});
	pi.on("turn_start", (_event, ctx) => {
		if (!ctx.hasUI) return;
		clearStartupHero(ctx);
	});
	pi.on("session_shutdown", (_event, ctx) => {
		if (!ctx.hasUI) return;
		clearStartupHero(ctx);
	});
}
