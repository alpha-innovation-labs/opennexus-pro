import { isImageLine } from "@earendil-works/pi-tui/dist/terminal-image";
import type { CompositeLineAt, TuiWithInlineImageOverlayPatch } from "./types";

/**
 * Composites overlays over inline-image terminal rows by treating image rows as blank cells.
 *
 * @param originalCompositeLineAt Original Pi TUI line compositor.
 * @returns Patched compositor that lets overlays replace image-backed rows.
 */
export function compositeOverlayOverImageLine(originalCompositeLineAt: CompositeLineAt): CompositeLineAt {
	return function compositeLineAtWithImageOverlay(
		this: TuiWithInlineImageOverlayPatch,
		baseLine: string,
		overlayLine: string,
		startCol: number,
		overlayWidth: number,
		totalWidth: number,
	): string {
		const compositableBaseLine = isImageLine(baseLine) ? "" : baseLine;
		return originalCompositeLineAt.call(this, compositableBaseLine, overlayLine, startCol, overlayWidth, totalWidth);
	};
}
