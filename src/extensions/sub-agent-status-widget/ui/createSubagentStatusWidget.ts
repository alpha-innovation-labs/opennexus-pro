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
      const running = runs.filter((run) => run.status === "running");
      const queued = runs.filter((run) => run.status === "queued");
      if (!running.length && !queued.length) return [];

      const lines: string[] = [];
      lines.push(truncateToWidth(`${ctx.ui.theme.fg("accent", "●")} ${ctx.ui.theme.fg("accent", "Agents (async)")}`, widgetWidth, ctx.ui.theme.fg("dim", "…")));

      for (const run of running.slice(0, 8)) {
        const tool = getWidgetToolSummary(run);
        const status = ctx.ui.theme.fg("dim", "running");
        lines.push(
          truncateToWidth(
            `${ctx.ui.theme.fg("dim", "├─")} ${ctx.ui.theme.fg("accent", "●")} ${ctx.ui.theme.bold(run.subagentType)}  ${tool.icon} ${ctx.ui.theme.bold(tool.label)}${tool.summary ? ` ${ctx.ui.theme.fg("muted", tool.summary)}` : ""} ${ctx.ui.theme.fg("dim", "·")} ${status}`,
            widgetWidth,
            ctx.ui.theme.fg("dim", "…"),
          ),
        );
      }

      if (queued.length) {
        lines.push(
          truncateToWidth(
            `${ctx.ui.theme.fg("dim", "├─")} ${ctx.ui.theme.fg("muted", "◦")} ${ctx.ui.theme.fg("dim", `${queued.length} queued`)}`,
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
