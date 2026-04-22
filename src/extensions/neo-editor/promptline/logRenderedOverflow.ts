import { visibleWidth } from "@mariozechner/pi-tui";
import { logExtensionEvent } from "../../shared/observability/startup-debug.ts";

/**
 * Logs rendered line overflows for promptline diagnostics.
 *
 * @param lines Rendered lines.
 * @param width Target width.
 */
export function logRenderedOverflow(lines: string[], width: number): void {
  for (const [index, renderedLine] of lines.entries()) {
    const renderedWidth = visibleWidth(renderedLine);
    if (renderedWidth > width) {
      logExtensionEvent("neo-editor", "overflow", { width, lineIndex: index, renderedWidth });
    }
  }
}
