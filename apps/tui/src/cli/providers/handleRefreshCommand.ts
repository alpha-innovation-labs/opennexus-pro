import type { AiGateway } from "@nexus/extensions/ai-providers/AiGateway.js";
import { readProviderConfig } from "@nexus/extensions/ai-providers/config/readProviderConfig.js";
import { getGateways } from "@nexus/extensions/ai-providers/gateways/getGateways.js";
import { getAllProviderIds } from "./getAllProviderIds.js";
import { Table } from "console-table-printer";
import { GRAY, GREEN, ORANGE, RED, RESET } from "../shared/ansiColors.js";

/**
 * Handles the "refresh" subcommand: probes each provider (or a single one)
 * and fetches their available models, updating the model cache.
 *
 * If providerId is provided: builds a single gateway, calls exists() then fetchModels().
 * If no providerId: iterates over all configured providers, builds each gateway, probes and fetches.
 *
 * @param providerId Optional provider ID to refresh (refreshes all if omitted).
 * @param gateways Array of all gateway instances.
 * @returns Exit code.
 */
export async function handleRefreshCommand(
  providerId?: string,
  gateways?: AiGateway[],
): Promise<number> {
  const providerConfig = readProviderConfig();
  const allGateways = gateways ?? getGateways(providerConfig);
  const allProviderIds = getAllProviderIds();

  const gatewaysToRefresh = providerId
    ? allGateways.filter((gw) => gw.providerId === providerId)
    : allGateways;

  if (gatewaysToRefresh.length === 0) {
    if (providerId) {
      console.log(`Provider '${providerId}' is not configured. Nothing to refresh.`);
    } else {
      console.log("No configured providers to refresh.");
    }
    return 0;
  }

  type Row = { Provider: string; Status: string };

  const results = await Promise.all(gatewaysToRefresh.map(async (gw) => {
    const probe = await gw.exists();
    const models = await gw.fetchModels();
    if (probe.status === "ok") {
      return { Provider: `${GREEN}${gw.providerId}${RESET}`, Status: `${GREEN}${models.length} models found${RESET}` };
    } else if (probe.status === "access-denied") {
      return {
        Provider: `${RED}${gw.providerId}${RESET}`,
        Status: `${RED}Access denied — ${probe.reason}${RESET}`,
      };
    } else {
      // unreachable: connection error (DNS failure, connection refused, timeout)
      const port = gw.baseUrl.split(':')[2]?.replace('/', '') ?? '';
      const portHint = port ? `port ${port}` : "a port";
      return {
        Provider: `${GRAY}${gw.providerId}${RESET}`,
        Status: `${GRAY}Nothing is running on ${portHint}${RESET}`,
      };
    }
  }));

  // Sort: models found (green) first, then access-denied (red), then unreachable (gray).
  results.sort((a, b) => {
    const aGreen = a.Status.includes("models found");
    const bGreen = b.Status.includes("models found");
    const aAccessDenied = a.Status.includes("Access denied");
    const bAccessDenied = b.Status.includes("Access denied");
    const aUnreachable = a.Status.includes("Nothing is running");
    const bUnreachable = b.Status.includes("Nothing is running");
    // Priority: green=0, red=1, gray=2
    const aPriority = aGreen ? 0 : aAccessDenied ? 1 : aUnreachable ? 2 : 0;
    const bPriority = bGreen ? 0 : bAccessDenied ? 1 : bUnreachable ? 2 : 0;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.Provider.localeCompare(b.Provider);
  });

  const rows: Row[] = results;

  if (rows.length > 0) {
    const ct = new Table({
      columns: [
        { name: "Provider", alignment: "left" },
        { name: "Status", alignment: "left" },
      ],
      border: {},
    });
    ct.addRows(rows);
    ct.printTable();
  }

  return 0;
}
