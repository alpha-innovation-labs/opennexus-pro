import type { AiGateway } from "@nexus/extensions/ai-providers/index.js";
import { readProviderConfig } from "@nexus/extensions/ai-providers/config/readProviderConfig.js";
import { getGateways } from "@nexus/extensions/ai-providers/gateway/getGateways.js";
import { getAllProviderIds } from "./getAllProviderIds.js";
import { getModelCachePath, readProviderStateCache, writeProviderStateCache, type ProviderStateCache } from "@nexus/extensions/ai-providers/cache/index.js";
import { Table } from "console-table-printer";
import { GRAY, GREEN, ORANGE, RED, RESET } from "../shared/ansiColors.js";

interface RefreshResult {
  providerId: string;
  probe: Awaited<ReturnType<AiGateway["exists"]>>;
  models: Awaited<ReturnType<AiGateway["fetchModels"]>>;
  statusLine: string;
}

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

  // Probe each gateway once, storing results for both display and cache write.
  const refreshResults: RefreshResult[] = await Promise.all(
    gatewaysToRefresh.map(async (gw) => {
      const probe = await gw.exists();
      const models = await gw.getModels();
      let statusLine: string;
      if (probe.status === "ok") {
        statusLine = `${GREEN}${models.length} models found${RESET}`;
      } else if (probe.status === "access-denied") {
        statusLine = `${RED}Access denied — ${probe.reason}${RESET}`;
      } else {
        const port = gw.baseUrl.split(':')[2]?.replace('/', '') ?? '';
        const portHint = port ? `port ${port}` : "a port";
        statusLine = `${GRAY}Nothing is running on ${portHint}${RESET}`;
      }
      return { providerId: gw.providerId, probe, models, statusLine };
    }),
  );

  // Sort: models found (green) first, then access-denied (red), then unreachable (gray).
  refreshResults.sort((a, b) => {
    const aGreen = a.statusLine.includes("models found");
    const bGreen = b.statusLine.includes("models found");
    const aAccessDenied = a.statusLine.includes("Access denied");
    const bAccessDenied = b.statusLine.includes("Access denied");
    const aUnreachable = a.statusLine.includes("Nothing is running");
    const bUnreachable = b.statusLine.includes("Nothing is running");
    // Priority: green=0, red=1, gray=2
    const aPriority = aGreen ? 0 : aAccessDenied ? 1 : aUnreachable ? 2 : 0;
    const bPriority = bGreen ? 0 : bAccessDenied ? 1 : bUnreachable ? 2 : 0;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.providerId.localeCompare(b.providerId);
  });

  // Display table.
  const ct = new Table({
    columns: [
      { name: "Provider", alignment: "left" },
      { name: "Status", alignment: "left" },
    ],
    border: {},
  });
  for (const r of refreshResults) {
    ct.addRow({ Provider: `${GREEN}${r.providerId}${RESET}`, Status: r.statusLine });
  }
  ct.printTable();

  // Write only models to the provider state cache (probe is live-only).
  const cachePath = getModelCachePath();
  const existingCache = await readProviderStateCache(cachePath);
  const cacheToUpdate: ProviderStateCache = { ...existingCache };
  for (const r of refreshResults) {
    cacheToUpdate[r.providerId] = r.models;
  }
  await writeProviderStateCache(cachePath, cacheToUpdate);

  return 0;
}
