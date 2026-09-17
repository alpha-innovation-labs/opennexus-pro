import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { Theme } from "./agent-widget.js";

type Component = { render(width: number): string[]; invalidate(): void };
type Slot = "metadata" | "fleet";
type Layout = { metadata?: Component; fleet?: Component; editorRows?: number; editorWidth?: number; budget: number; measureBudget?: (width?: number) => number };
// Stored on the TUI, not a UI-context wrapper or module singleton: extension
// loaders may instantiate this module twice and tool contexts may change.
const STATE = Symbol.for("nexus.below-editor-layout");
export const BELOW_EDITOR_KEY = "observations-status-widget";
function state(tui: any): Layout {
  return tui[STATE] ??= { budget: 0 };
}

export function reportEditorRows(tui: any, width: number, rows: number): void {
  Object.assign(state(tui), { editorRows: rows, editorWidth: width });
}

export function fleetHeightBudget(tui: any, width?: number): number {
  const layout = state(tui);
  return layout.measureBudget?.(width) ?? layout.budget;
}

/** One physical widget owns the order, regardless of which extension loads first. */
export function setBelowEditorSlot(
  ui: { setWidget(key: string, factory: (tui: any, theme: Theme) => Component, options: { placement: "belowEditor" }): void; getEditorText(): string },
  slot: Slot,
  factory: ((tui: any, theme: Theme) => Component) | undefined,
): void {
  ui.setWidget(BELOW_EDITOR_KEY, (tui, theme) => {
    const layout = state(tui);
    layout[slot] = factory?.(tui, theme);
    if (slot === "metadata" && !factory) {
      layout.editorRows = undefined;
      layout.editorWidth = undefined;
    }
    return {
      render(width) {
        const metadata = layout.metadata?.render(width) ?? [];
        // Also callable before repaint, so resize cannot leave keyboard focus
        // attached to a row that no longer fits.
        layout.measureBudget = (renderWidth?: number) => {
          const currentWidth = renderWidth ?? tui.terminal.columns ?? width;
          const fallbackRows = 2 + ui.getEditorText().split("\n").reduce(
            (sum, line) => sum + Math.max(1, Math.ceil((visibleWidth(line) + 1) / Math.max(1, currentWidth - 4))), 0);
          const editorRows = layout.editorWidth === currentWidth ? layout.editorRows ?? fallbackRows : fallbackRows;
          return Math.max(0, Math.min(7, (tui.terminal.rows ?? 24) - editorRows - metadata.length - 2));
        };
        layout.budget = layout.measureBudget(width);
        return [...metadata, ...(layout.fleet?.render(width) ?? []).slice(0, layout.budget)]
          .map(line => truncateToWidth(line, Math.max(0, width)));
      },
      invalidate() {
        layout.metadata?.invalidate();
        layout.fleet?.invalidate();
      },
    };
  }, { placement: "belowEditor" });
}
