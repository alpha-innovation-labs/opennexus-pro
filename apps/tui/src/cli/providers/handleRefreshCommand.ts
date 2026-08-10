import type { AiGateway } from "@extensions/ai-providers/index.js";
import { readProviderConfig } from "@extensions/ai-providers/config/readProviderConfig.js";
import { getGateways } from "@extensions/ai-providers/gateway/getGateways.js";
import { getAllProviderIds } from "./getAllProviderIds.js";
import { getModelCachePath, readProviderStateCache, writeProviderStateCache, type ProviderStateCache } from "@extensions/ai-providers/cache/index.js";
import { Table } from "console-table-printer";
import { GRAY, GREEN, ORANGE, RED, RESET } from "../shared/ansiColors.js";

type RefreshStatus = "ok" | "access-denied" | "not-a-gateway" | "no-provider";

interface RefreshResult {
  providerId: string;
  port: string;
  probe: Awaited<ReturnType<AiGateway["exists"]>>;
  models: Awaited<ReturnType<AiGateway["fetchModels"]>>;
  status: RefreshStatus;
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
  const allGateways = gateways ?? (await getGateways(readProviderConfig()));
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
      const port = gw.baseUrl.split(':')[2]?.replace('/', '') ?? '';
      const probe = await gw.exists();
      const models = await gw.refreshModels();
      let status: RefreshStatus;
      let statusLine: string;
      if (probe.status === "ok") {
        status = "ok";
        statusLine = `${GREEN}${models.length} models found${RESET}`;
      } else if (probe.status === "access-denied") {
        status = "access-denied";
        statusLine = `${RED}Access denied${RESET}`;
      } else if (probe.status === "not-a-gateway") {
        status = "not-a-gateway";
        statusLine = `${ORANGE}Something is listening${RESET}`;
      } else {
        status = "no-provider";
        statusLine = `${GRAY}No provider running${RESET}`;
      }
      return { providerId: gw.providerId, port, probe, models, status, statusLine };
    }),
  );

  // Sort: ok (green) first, then access-denied (red),
  // then not-a-gateway (orange), then no-provider (dim).
  refreshResults.sort((a, b) => {
    // Priority: ok=0, access-denied=1, not-a-gateway=2, no-provider=3
    const priorityOrder: Record<RefreshStatus, number> = {
      ok: 0,
      "access-denied": 1,
      "not-a-gateway": 2,
      "no-provider": 3,
    };
    return priorityOrder[a.status] - priorityOrder[b.status] || a.providerId.localeCompare(b.providerId);
  });

  // Display table.
  const ct = new Table({
    columns: [
      { name: "Provider", alignment: "left" },
      { name: "Port", alignment: "right" },
      { name: "Status", alignment: "left" },
    ],
    border: {},
  });
  for (const r of refreshResults) {
    let rowColor = GREEN;
    if (r.status === "access-denied") {
      rowColor = RED;
    } else if (r.status === "not-a-gateway") {
      rowColor = ORANGE;
    } else if (r.status === "no-provider") {
      rowColor = GRAY;
    }
    ct.addRow({ Provider: `${rowColor}${r.providerId}${RESET}`, Port: `${rowColor}${r.port}${RESET}`, Status: r.statusLine });
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
