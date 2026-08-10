import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createStartupHeroWidget } from "./createStartupHeroWidget.js";
import { getStartupDurationBadge } from "./getStartupDurationBadge.js";
import { getStartupHeroStatus } from "./getStartupHeroStatus.js";
import { getStartupHeroVersion } from "./getStartupHeroVersion.js";
import { shouldShowStartupDurationBadge } from "./shouldShowStartupDurationBadge.js";
import { startupHeroWidgetKey } from "./startupHeroWidgetKey.js";

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
