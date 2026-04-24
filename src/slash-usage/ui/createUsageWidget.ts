import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth } from "@mariozechner/pi-tui";
import { renderUsageTextForModel } from "../model/renderUsageTextForModel.js";

/**
 * Creates the below-editor usage widget component.
 *
 * @param ctx Pi extension context.
 * @returns Renderable widget component.
 */
export function createUsageWidget(ctx: ExtensionContext): { invalidate(): void; render(width: number): string[] } {
	return {
		invalidate(): void {},
		render(width: number): string[] {
			const line = renderUsageTextForModel(ctx.ui.theme, ctx.model);
			return [truncateToWidth(line, Math.max(1, width), ctx.ui.theme.fg("dim", "…"))];
		},
	};
}
