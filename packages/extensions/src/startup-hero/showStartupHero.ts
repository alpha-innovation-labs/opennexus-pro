import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createStartupHeroWidget } from "./createStartupHeroWidget.js";
import { getStartupHeroStatus } from "./getStartupHeroStatus.js";
import { getStartupHeroVersion } from "./getStartupHeroVersion.js";
import { startupHeroWidgetKey } from "./startupHeroWidgetKey.js";

/**
 * Renders the startup hero above the editor.
 *
 * @param ctx Pi extension context.
 */
export function showStartupHero(ctx: ExtensionContext): void {
	const version = getStartupHeroVersion();
	const status = getStartupHeroStatus(ctx.getSystemPrompt());
	ctx.ui.setWidget(
		startupHeroWidgetKey,
		(tui, theme) => createStartupHeroWidget(tui, theme, version, status),
		{ placement: "aboveEditor" },
	);
}
