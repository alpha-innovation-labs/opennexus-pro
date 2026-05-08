import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "../../slash-menu/withSlashMenuGroup.js";
import { getRtkExecutionCwd } from "../runtime/getRtkExecutionCwd.js";
import { formatRtkSavings } from "../savings/formatRtkSavings.js";
import { getRtkGainJsonArgs } from "../savings/getRtkGainJsonArgs.js";
import { parseRtkGainJson } from "../savings/parseRtkGainJson.js";
import { fetchOpenRouterModelOptions } from "../pricing/fetchOpenRouterModelOptions.js";
import { getEarliestRtkGainDate } from "../savings/getEarliestRtkGainDate.js";
import { collectSessionTokenUsage } from "../usage/collectSessionTokenUsage.js";
import { showRtkSavingsModal } from "../ui/showRtkSavingsModal.js";

/**
 * Registers the RTK savings command.
 *
 * @param pi Pi extension API.
 */
export function registerSavingsCommand(pi: ExtensionAPI): void {
  pi.registerCommand("savings", withSlashMenuGroup({
    description: "Show Nexus token savings",
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

      const rtk = parseRtkGainJson(result.stdout);
      const usage = await collectSessionTokenUsage(getEarliestRtkGainDate(rtk));
      const availableModels = await fetchOpenRouterModelOptions().catch(() => []);
      const selectedModel = availableModels.find((model) => model.id.endsWith(`/${usage.mostUsedModel}`)) ?? availableModels[0];
      const report = { availableModels, pricing: selectedModel?.pricing, pricingModelId: selectedModel?.id, rtk, usage };
      if (ctx.hasUI) await showRtkSavingsModal(ctx, report);
      else console.log(formatRtkSavings(rtk));
    },
  }, "Extensions"));
}
