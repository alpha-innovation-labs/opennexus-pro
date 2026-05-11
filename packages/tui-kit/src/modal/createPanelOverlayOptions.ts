import type { SizeValue } from "@earendil-works/pi-tui";

export type PanelOverlayWidthMode = "full" | "modal";

export type PanelOverlayConfig = {
  widthMode?: PanelOverlayWidthMode;
};

export type PanelOverlayOptions = {
  anchor: "center";
  width: SizeValue;
  minWidth: number;
  maxHeight: SizeValue;
};

/**
 * Resolves the overlay compositing width for centered panels.
 *
 * @param minWidth Minimum modal width.
 * @param widthMode Overlay width behavior.
 * @returns Full terminal width or modal-sized width.
 */
function resolvePanelOverlayWidth(minWidth: number, widthMode: PanelOverlayWidthMode): SizeValue {
  return widthMode === "modal" ? minWidth : "100%";
}

/**
 * Creates overlay options for centered panels.
 *
 * Full mode spans the terminal to mask underlying text. Modal mode constrains the
 * overlay rectangle to the panel width so only the occupied area is composited.
 *
 * @param minWidth Minimum overlay and modal width.
 * @param maxHeight Maximum overlay height.
 * @param config Overlay behavior configuration.
 * @returns Centered overlay options.
 */
export function createPanelOverlayOptions(minWidth: number, maxHeight: SizeValue = "90%", config: PanelOverlayConfig = {}): PanelOverlayOptions {
  return {
    anchor: "center",
    width: resolvePanelOverlayWidth(minWidth, config.widthMode ?? "full"),
    minWidth,
    maxHeight,
  };
}
