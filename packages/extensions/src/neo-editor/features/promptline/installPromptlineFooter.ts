import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { PromptlineDeps } from "./types.js";
import { renderPromptlineFooter } from "./render/renderPromptlineFooter.js";

/**
 * Installs or replaces the Neo promptline footer component.
 *
 * @param ctx Extension context owning the footer.
 * @param deps Promptline dependencies.
 * @param modelOverride Optional model to render immediately.
 */
export function installPromptlineFooter(
	ctx: ExtensionContext,
	deps: Pick<PromptlineDeps, "getThinkingLevel">,
	modelOverride?: ExtensionContext["model"],
): void {
	if (typeof ctx.ui.setFooter !== "function") return;
	ctx.ui.setFooter((_tui, theme) => ({
		dispose() {},
		invalidate() {},
		render(width: number): string[] {
			return renderPromptlineFooter(width, theme, ctx, deps.getThinkingLevel, modelOverride);
		},
	}));
}
