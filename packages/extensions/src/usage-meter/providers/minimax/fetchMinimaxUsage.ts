import { fetchJson } from "../../shared/fetchJson.js";
import type { ProviderName, UsageSnapshot } from "../../types.js";
import { getMinimaxToken } from "./getMinimaxToken.js";
import { getMinimaxUsageEndpoint } from "./getMinimaxUsageEndpoint.js";
import { parseMinimaxUsageResponse } from "./parseMinimaxUsageResponse.js";

/**
 * Fetches MiniMax Coding Plan usage.
 *
 * @param provider MiniMax usage provider key.
 * @returns MiniMax usage snapshot.
 */
export async function fetchMinimaxUsage(provider: Extract<ProviderName, "minimax" | "minimax-cn">): Promise<UsageSnapshot> {
  const region = provider === "minimax-cn" ? "cn" : "global";
  const token = getMinimaxToken(region);
  if (!token) return { provider, windows: [], fetchedAt: Date.now(), error: "no-auth" };
  const result = await fetchJson(getMinimaxUsageEndpoint(region), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "MM-API-Source": "Nexus",
    },
  });
  if (!result.ok) return { provider, windows: [], fetchedAt: Date.now(), error: result.error };
  try {
    return { provider, windows: parseMinimaxUsageResponse(result.data), fetchedAt: Date.now() };
  } catch (error) {
    return { provider, windows: [], fetchedAt: Date.now(), error: error instanceof Error ? error.message : String(error) };
  }
}
