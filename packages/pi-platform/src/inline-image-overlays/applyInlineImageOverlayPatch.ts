import { TUI } from "@earendil-works/pi-tui";
import { compositeOverlayOverImageLine } from "./compositeOverlayOverImageLine";
import { renderWithInlineImageCleanup } from "./renderWithInlineImageCleanup";
import type { TuiWithInlineImageOverlayPatch } from "./types";

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
