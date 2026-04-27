import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "../../neo-editor/features/menu/withSlashMenuGroup.js";
import { getRtkExecutionCwd } from "../runtime/getRtkExecutionCwd.js";
import { formatRtkSavings } from "../savings/formatRtkSavings.js";
import { getRtkGainJsonArgs } from "../savings/getRtkGainJsonArgs.js";
import { parseRtkGainJson } from "../savings/parseRtkGainJson.js";
import { showRtkSavingsModal } from "../ui/showRtkSavingsModal.js";

/**
 * Registers the RTK savings command.
 *
 * @param pi Pi extension API.
 */
export function registerSavingsCommand(pi: ExtensionAPI): void {
  pi.registerCommand("savings", withSlashMenuGroup({
    description: "Show RTK token savings",
    handler: async (_args, ctx) => {
      const result = await pi.exec("rtk", ["gain", ...getRtkGainJsonArgs()], {
        cwd: getRtkExecutionCwd(ctx),
        signal: ctx.signal,
      }) as { code: number; stdout: string; stderr: string };

      if (result.code !== 0) {
        const message = result.stderr.trim() || "rtk gain failed";
        if (ctx.hasUI) ctx.ui.notify(message, "error");
        else console.error(message);
        return;
      }

      const report = parseRtkGainJson(result.stdout);
      if (ctx.hasUI) await showRtkSavingsModal(ctx, report);
      else console.log(formatRtkSavings(report));
    },
  }, "Diagnostics"));
}
