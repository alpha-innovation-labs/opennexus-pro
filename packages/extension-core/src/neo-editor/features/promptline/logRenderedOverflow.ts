import { visibleWidth } from "@earendil-works/pi-tui";
import { isStartupProfileEnabled } from "@nexus/observability/startup-profile/isStartupProfileEnabled.js";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";

/**
 * Logs rendered line overflows for promptline diagnostics.
 *
 * @param lines Rendered lines.
 * @param width Target width.
 */
export function logRenderedOverflow(lines: string[], width: number): void {
  if (!isStartupProfileEnabled()) return;
  for (const [index, renderedLine] of lines.entries()) {
    const renderedWidth = visibleWidth(renderedLine);
    if (renderedWidth > width) {
      logExtensionEvent("neo-editor", "overflow", { width, lineIndex: index, renderedWidth });
    }
  }
}
