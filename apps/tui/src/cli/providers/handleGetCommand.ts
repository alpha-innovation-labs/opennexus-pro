import type { AiGateway } from "@nexus/extensions/ai-providers/AiGateway.js";
import { readProviderConfig } from "@nexus/extensions/ai-providers/config/readProviderConfig.js";
import { getGateways } from "@nexus/extensions/ai-providers/gateways/getGateways.js";
import { getAllProviderIds } from "./getAllProviderIds.js";
import { Table } from "console-table-printer";
import { GREEN, RESET } from "../shared/ansiColors.js";

/**
 * Handles the "get" subcommand: displays available models for a configured provider.
 *
 * If the provider is not configured, notifies the user to run setup first.
 * If the provider is configured but unreachable, reports it as offline.
 * If reachable, fetches and displays the model list.
 *
 * @param providerId Provider identifier.
 * @param gateways Array of all gateway instances.
 * @returns Exit code.
 */
export async function handleGetCommand(
  providerId: string,
  gateways?: AiGateway[],
): Promise<number> {
  const knownIds = getAllProviderIds();
  if (!knownIds.includes(providerId)) {
    console.error(`Unknown provider: ${providerId}`);
    console.error(`Known providers: ${knownIds.join(", ")}`);
    return 1;
  }

  const providerConfig = readProviderConfig();
  const allGateways = gateways ?? getGateways(providerConfig);
  const gw = allGateways.find((g) => g.providerId === providerId);

  if (!gw) {
    console.log(`Provider '${providerId}' is not configured. Run 'nexus provider setup ${providerId}' to configure it.`);
    return 1;
  }

  const probe = await gw.exists();
  if (probe.status === "unreachable") {
    console.log(`Provider '${providerId}' is not running at ${gw.baseUrl} (${probe.reason}).`);
    return 1;
  }
  // probe.status === "error" — server responded but rejected; fall through to fetchModels.

  const models = await gw.fetchModels();
  if (models.length === 0) {
    if (probe.status === "error") {
      console.log(`Provider '${providerId}' responded with ${probe.statusCode} ${probe.statusText} at ${gw.baseUrl}.`);
    } else {
      console.log(`Provider '${providerId}' is running but has no models available.`);
    }
    return 0;
  }

  const formatReasoning = (r: boolean): string => (r ? "yes" : "no");
  const formatInput = (input: string[]): string => input.join(",");
  const formatContextWindow = (w: number): string => w.toLocaleString();
  const formatMaxTokens = (t: number): string => t.toLocaleString();

  const tableData = models.map((model) => ({
    Model: `${GREEN}${model.id}${RESET}`,
    Reasoning: formatReasoning(model.reasoning),
    Input: formatInput(model.input),
    Context: formatContextWindow(model.contextWindow),
    MaxTokens: formatMaxTokens(model.maxTokens),
  }));

  const ct = new Table({
    columns: [
      { name: "Model", alignment: "left" },
      { name: "Reasoning", alignment: "center" },
      { name: "Input", alignment: "center" },
      { name: "Context", alignment: "right" },
      { name: "MaxTokens", alignment: "right" },
    ],
    border: {},
  });
  ct.addRows(tableData);
  ct.printTable();
  return 0;
}
