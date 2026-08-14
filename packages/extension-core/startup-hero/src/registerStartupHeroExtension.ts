import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { clearStartupHero } from "./clearStartupHero";
import { shouldShowStartupHero } from "./shouldShowStartupHero";
import { showStartupHero } from "./showStartupHero";

interface ExtensionRegistrationCounts {
	enabledExtensionCount: number;
	enabledMiniAppCount: number;
}

/**
 * Registers the startup hero widget for fresh sessions.
 *
 * @param pi Pi extension API.
 * @param counts Pre-computed extension counts (computed by the feature-flags
 *   system and passed through createExtensionRegistrationTask).
 */
export function registerStartupHeroExtension(
	pi: ExtensionAPI,
	counts?: ExtensionRegistrationCounts,
): void {
	const extCount = counts?.enabledExtensionCount ?? 0;
	const miniCount = counts?.enabledMiniAppCount ?? 0;
	pi.on("session_start", (event, ctx) => {
		if (!ctx.hasUI || !shouldShowStartupHero(event.reason, process.argv)) {
			clearStartupHero(ctx);
			return;
		}
		showStartupHero(ctx, extCount, miniCount);
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
