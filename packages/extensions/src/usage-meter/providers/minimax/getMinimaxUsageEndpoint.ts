/**
 * Resolves the MiniMax Coding Plan remains endpoint for a region.
 *
 * @param region MiniMax provider region.
 * @returns Coding Plan remains endpoint URL.
 */
export function getMinimaxUsageEndpoint(region: "global" | "cn"): string {
  return region === "cn"
    ? "https://api.minimaxi.com/v1/api/openplatform/coding_plan/remains"
    : "https://api.minimax.io/v1/api/openplatform/coding_plan/remains";
}
