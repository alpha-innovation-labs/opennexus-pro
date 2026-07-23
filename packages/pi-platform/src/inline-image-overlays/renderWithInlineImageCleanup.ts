import { deleteAllKittyImages, getCapabilities } from "@earendil-works/pi-tui/dist/terminal-image.js";
import type { DoRender, TuiWithInlineImageOverlayPatch } from "./types.js";

/**
 * Renders with a Kitty image cleanup prefix while an overlay is visible.
 *
 * @param originalDoRender Original Pi TUI render method.
 * @returns Patched render method that removes visible inline images before overlay redraws.
 */
export function renderWithInlineImageCleanup(originalDoRender: DoRender): DoRender {
	return function doRenderWithInlineImageCleanup(this: TuiWithInlineImageOverlayPatch): void {
		if (!this.hasOverlay() || getCapabilities().images !== "kitty") {
			originalDoRender.call(this);
			return;
		}

		let cleanupWritten = false;
		const originalWrite = this.terminal.write.bind(this.terminal);
		this.terminal.write = (data: string): void => {
			if (!cleanupWritten) {
				cleanupWritten = true;
				originalWrite(deleteAllKittyImages());
			}
			originalWrite(data);
		};

		try {
			originalDoRender.call(this);
		} finally {
			this.terminal.write = originalWrite;
		}
	};
}
