import type { SharedModalPane } from "@nexus/tui-kit/modal/index.js";
import type { DevModalTheme, DevModalVariation } from "./types.js";

/**
 * Creates shared modal panes for the selected dev modal variation.
 *
 * @param variation Selected modal variation.
 * @param theme Theme color helpers.
 * @returns Modal panes with deterministic sample content.
 */
export function createDevModalPanes(variation: DevModalVariation, theme: DevModalTheme): SharedModalPane[] {
  return [
    {
      id: "summary",
      size: 1,
      minWidth: 20,
      lines: [theme.fg("accent", `Variation: ${variation.id}`), "", ...variation.rows],
    },
    {
      id: "details",
      size: 2,
      minWidth: 30,
      lines: [
        "Random fixture data",
        "",
        `Trace id: ${variation.id}-trace-001`,
        `Checksum: ${variation.id.length * 137}`,
        `Rows: ${variation.rows.length}`,
      ],
    },
  ];
}
