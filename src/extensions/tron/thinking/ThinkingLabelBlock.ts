import { Container, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { theme } from "../../../pi-internals/theme.js";
import { colorToolCallIcon } from "../colors/colorToolCallIcon.ts";
import { measureTronRender } from "../profiling/measureTronRender.js";

/**
 * Compact bordered renderer for hidden assistant thinking.
 */
export class ThinkingLabelBlock extends Container {
  private cachedWidth: number | undefined;
  private cachedLines: string[] | undefined;

  constructor(
    private readonly label: string,
    private readonly connectToTools: boolean,
    private readonly connectFromTool: boolean = false,
  ) {
    super();
  }

  /**
   * Renders the hidden thinking label.
   *
   * @param width Available width.
   * @returns Rendered lines.
   */
  render(width: number): string[] {
    if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;

    const lines = measureTronRender("thinking-label-block", () => {
      const innerWidth = Math.max(1, width - 2);
      const prefixPlain = "󰧑";
      const prefixStyled = colorToolCallIcon(prefixPlain);
      const contentWidth = Math.max(1, innerWidth - visibleWidth(prefixPlain) - 1);
      const body = truncateToWidth(this.label, contentWidth, "…");
      const plainLine = `${prefixPlain} ${body}`;
      const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(plainLine)));
      // const topBorder = this.connectFromTool
      //   ? `├${"─".repeat(innerWidth)}┤`
      //   : `┌${"─".repeat(innerWidth)}┐`;
      const previousToolBorder = `└${"─".repeat(innerWidth)}┘`;
      const topBorder = `┌${"─".repeat(innerWidth)}┐`;
      const bottomBorder = this.connectToTools
        ? `├${"─".repeat(innerWidth)}┤`
        : `└${"─".repeat(innerWidth)}┘`;
      const lines = [
        theme.fg("borderMuted", topBorder),
        `${theme.fg("borderMuted", "│")}${prefixStyled} ${theme.italic(theme.fg("toolOutput", body))}${pad}${theme.fg("borderMuted", "│")}`,
        theme.fg("borderMuted", bottomBorder),
      ];
      if (this.connectFromTool) lines.unshift(theme.fg("borderMuted", previousToolBorder));
      return lines;
    }, { width, labelLength: this.label.length });
    this.cachedWidth = width;
    this.cachedLines = lines;
    return lines;
  }
}
