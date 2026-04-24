import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth } from "@mariozechner/pi-tui";
import { sharedSubagentRuntime } from "../../sub-agents/runtime/sharedSubagentRuntime.js";
import { getWidgetToolSummary } from "./getWidgetToolSummary.js";

/**
 * Creates the Tintin-style subagent status widget.
 *
 * @param ctx Extension runtime context.
 * @returns Renderable widget component.
 */
export function createSubagentStatusWidget(ctx: ExtensionContext): { invalidate(): void; render(width: number): string[] } {
  return {
    invalidate(): void {},
    render(widgetWidth: number): string[] {
      const runs = sharedSubagentRuntime.listRuns();
      if (!runs.length) return [];

      const lines: string[] = [];
      lines.push(truncateToWidth(`${ctx.ui.theme.fg("accent", "●")} ${ctx.ui.theme.fg("accent", "Agents (async)")}`, widgetWidth, ctx.ui.theme.fg("dim", "…")));

      for (const run of runs.slice(0, 8)) {
        const tool = getWidgetToolSummary(run);
        const status = ctx.ui.theme.fg("dim", run.status);
        const accent = run.status === "running"
          ? ctx.ui.theme.fg("accent", "●")
          : run.status === "queued"
            ? ctx.ui.theme.fg("muted", "◦")
            : run.status === "completed"
              ? ctx.ui.theme.fg("success", "✓")
              : run.status === "error"
                ? ctx.ui.theme.fg("error", "✗")
                : ctx.ui.theme.fg("warning", "■");
        lines.push(
          truncateToWidth(
            `${ctx.ui.theme.fg("dim", "├─")} ${accent} ${ctx.ui.theme.bold(run.subagentType)}  ${tool.icon} ${ctx.ui.theme.bold(tool.label)}${tool.summary ? ` ${ctx.ui.theme.fg("muted", tool.summary)}` : ""} ${ctx.ui.theme.fg("dim", "·")} ${status}`,
            widgetWidth,
            ctx.ui.theme.fg("dim", "…"),
          ),
        );
      }

      if (lines.length > 1) {
        const lastIndex = lines.length - 1;
        lines[lastIndex] = lines[lastIndex].replace("├─", "└─");
      }

      return lines;
    },
  };
}
