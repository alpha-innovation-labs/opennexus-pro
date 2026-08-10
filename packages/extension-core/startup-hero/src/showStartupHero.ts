import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createStartupHeroWidget } from "./createStartupHeroWidget";
import { getStartupDurationBadge } from "./getStartupDurationBadge";
import { getStartupHeroStatus } from "./getStartupHeroStatus";
import { getStartupHeroVersion } from "./getStartupHeroVersion";
import { shouldShowStartupDurationBadge } from "./shouldShowStartupDurationBadge";
import { startupHeroWidgetKey } from "./startupHeroWidgetKey";

/**
 * Renders the startup hero above the editor.
 *
 * @param ctx Pi extension context.
 */
export function showStartupHero(ctx: ExtensionContext): void {
	const version = getStartupHeroVersion();
	const status = getStartupHeroStatus(ctx.getSystemPrompt());
	const startupDurationBadge = shouldShowStartupDurationBadge(import.meta.url) ? getStartupDurationBadge() : undefined;
	ctx.ui.setWidget(
		startupHeroWidgetKey,
		(tui, theme) => createStartupHeroWidget(tui, theme, version, status, startupDurationBadge),
		{ placement: "aboveEditor" },
	);
}
