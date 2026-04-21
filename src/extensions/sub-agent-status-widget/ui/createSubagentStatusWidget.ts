import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth } from "@mariozechner/pi-tui";
import { sharedSubagentRuntime } from "../../sub-agents/runtime/sharedSubagentRuntime.js";
import { getPromptStartedAt } from "../runtime/promptWorkingState.js";
import { getWidgetToolSummary } from "./getWidgetToolSummary.js";

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/**
 * Formats elapsed time for one running row.
 *
 * @param startedAt Start timestamp.
 * @returns Compact elapsed label.
 */
function formatElapsed(startedAt?: number): string {
  if (!startedAt) return "0.0s";
  return `${((Date.now() - startedAt) / 1000).toFixed(1)}s`;
}

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
      const isWorking = !ctx.isIdle();
      if (!running.length && !queued.length && !isWorking) return [];

      const frame = SPINNER[Math.floor(Date.now() / 100) % SPINNER.length];
      const lines: string[] = [];

      if (running.length || queued.length) {
        lines.push(truncateToWidth(`${ctx.ui.theme.fg("accent", "●")} ${ctx.ui.theme.fg("accent", "Agents (async)")}`, widgetWidth, ctx.ui.theme.fg("dim", "…")));
      }

      for (const run of running.slice(0, 8)) {
        const tool = getWidgetToolSummary(run);
        const stats = ctx.ui.theme.fg("dim", formatElapsed(run.startedAt));
        lines.push(
          truncateToWidth(
            `${ctx.ui.theme.fg("dim", "├─")} ${ctx.ui.theme.fg("accent", frame)} ${ctx.ui.theme.bold(run.subagentType)}  ${tool.icon} ${ctx.ui.theme.bold(tool.label)}${tool.summary ? ` ${ctx.ui.theme.fg("muted", tool.summary)}` : ""} ${ctx.ui.theme.fg("dim", "·")} ${stats}`,
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

      if (isWorking) {
        const workingElapsed = formatElapsed(getPromptStartedAt());
        const connector = lines.length > 0 ? "├─" : "•";
        lines.push(
          truncateToWidth(
            `${ctx.ui.theme.fg("dim", connector)} ${ctx.ui.theme.fg("accent", frame)} ${ctx.ui.theme.fg("muted", "Working...")} ${ctx.ui.theme.fg("dim", "·")} ${ctx.ui.theme.fg("dim", workingElapsed)}`,
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
