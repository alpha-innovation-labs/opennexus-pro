export type PanelOverlayOptions = {
  anchor: "center";
  width: "100%";
  minWidth: number;
  maxHeight: string;
};

/**
 * Creates full-width overlay options for centered panels.
 *
 * The overlay itself spans the terminal to mask underlying text; each panel component
 * controls its own visible percentage width through its modal width policy.
 *
 * @param minWidth Minimum overlay width.
 * @param maxHeight Maximum overlay height.
 * @returns Full-width centered overlay options.
 */
export function createPanelOverlayOptions(minWidth: number, maxHeight = "90%"): PanelOverlayOptions {
  return {
    anchor: "center",
    width: "100%",
    minWidth,
    maxHeight,
  };
}
