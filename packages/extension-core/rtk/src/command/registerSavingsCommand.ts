import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@extensions/slash-menu/withSlashMenuGroup";
import { fetchOpenRouterModelOptions } from "../pricing/fetchOpenRouterModelOptions";
import { getRtkExecutionCwd } from "../runtime/getRtkExecutionCwd";
import { formatRtkSavings } from "../savings/formatRtkSavings";
import { getEarliestRtkGainDate } from "../savings/getEarliestRtkGainDate";
import { getRtkGainJsonArgs } from "../savings/getRtkGainJsonArgs";
import { parseRtkGainJson } from "../savings/parseRtkGainJson";
import { showRtkSavingsModal } from "../ui/showRtkSavingsModal";
import { collectSessionTokenUsage } from "../usage/collectSessionTokenUsage";

/**
 * Registers the RTK savings command.
 *
 * @param pi Pi extension API.
 */
export function registerSavingsCommand(pi: ExtensionAPI): void {
	pi.registerCommand(
		"savings",
		withSlashMenuGroup(
			{
				description: "Show Nexus token savings",
				handler: async (_args: string, ctx: ExtensionCommandContext) => {
					const result = (await pi.exec(
						"rtk",
						["gain", ...getRtkGainJsonArgs()],
						{
							cwd: getRtkExecutionCwd(ctx),
							signal: ctx.signal,
						},
					)) as { code: number; stdout: string; stderr: string };

					if (result.code !== 0) {
						const message = result.stderr.trim() || "rtk gain failed";
						if (ctx.hasUI) ctx.ui.notify(message, "error");
						else console.error(message);
						return;
					}

					const rtk = parseRtkGainJson(result.stdout);
					const usage = await collectSessionTokenUsage(
						getEarliestRtkGainDate(rtk),
					);
					const availableModels = await fetchOpenRouterModelOptions().catch(
						() => [],
					);
					const selectedModel =
						availableModels.find((model) =>
							model.id.endsWith(`/${usage.mostUsedModel}`),
						) ?? availableModels[0];
					const report = {
						availableModels,
						pricing: selectedModel?.pricing,
						pricingModelId: selectedModel?.id,
						rtk,
						usage,
					};
					if (ctx.hasUI) await showRtkSavingsModal(ctx, report);
					else console.log(formatRtkSavings(rtk));
				},
			},
			"Extensions",
		),
	);
}
