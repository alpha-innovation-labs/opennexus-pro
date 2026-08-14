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
 * @param enabledExtensionCount Pre-computed count of enabled extensions.
 * @param enabledMiniAppCount Pre-computed count of enabled mini-apps.
 */
export function showStartupHero(
	ctx: ExtensionContext,
	enabledExtensionCount: number,
	enabledMiniAppCount: number,
): void {
	const version = getStartupHeroVersion();
	const status = getStartupHeroStatus(
		ctx.getSystemPrompt(),
		enabledExtensionCount,
		enabledMiniAppCount,
	);
	const startupDurationBadge = shouldShowStartupDurationBadge(import.meta.url)
		? getStartupDurationBadge()
		: undefined;
	ctx.ui.setWidget(
		startupHeroWidgetKey,
		(tui, theme) =>
			createStartupHeroWidget(
				tui,
				theme,
				version,
				status,
				startupDurationBadge,
			),
		{ placement: "aboveEditor" },
	);
}
