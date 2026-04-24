import { TUI } from "@mariozechner/pi-tui";
import { compositeOverlayOverImageLine } from "./compositeOverlayOverImageLine.js";
import { renderWithInlineImageCleanup } from "./renderWithInlineImageCleanup.js";
import type { TuiWithInlineImageOverlayPatch } from "./types.js";

let inlineImageOverlayPatchApplied = false;

/**
 * Patches Pi TUI overlays so modals render above terminal inline images.
 */
export function applyInlineImageOverlayPatch(): void {
	if (inlineImageOverlayPatchApplied) return;

	const prototype = TUI.prototype as unknown as TuiWithInlineImageOverlayPatch;
	prototype.compositeLineAt = compositeOverlayOverImageLine(prototype.compositeLineAt);
	prototype.doRender = renderWithInlineImageCleanup(prototype.doRender);

	inlineImageOverlayPatchApplied = true;
}
