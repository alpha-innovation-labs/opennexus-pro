import type { ExtensionContext } from "@mariozechner/pi-coding-agent";

/**
 * Replaces Pi's built-in footer with an empty component so Neo owns model display.
 *
 * @param ctx Extension context owning the footer.
 */
export function installPromptlineFooter(ctx: ExtensionContext): void {
	if (typeof ctx.ui.setFooter !== "function") return;
	ctx.ui.setFooter(() => ({
		dispose() {},
		invalidate() {},
		render(): string[] {
			return [];
		},
	}));
}
