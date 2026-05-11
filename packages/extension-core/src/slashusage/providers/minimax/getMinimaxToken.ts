import { readNexusAuth } from "../../shared/readNexusAuth.js";

/**
 * Resolves the MiniMax API token from env or Nexus auth storage.
 *
 * @param region MiniMax provider region.
 * @returns MiniMax API token.
 */
export function getMinimaxToken(region: "global" | "cn"): string | undefined {
  const envToken = region === "cn" ? process.env.MINIMAX_CN_API_KEY : process.env.MINIMAX_API_KEY;
  if (envToken) return envToken;
  const auth = readNexusAuth();
  const keys = region === "cn" ? ["minimax-code-cn", "minimax-cn"] : ["minimax-code", "minimax"];
  for (const key of keys) {
    const token = getAuthToken(auth?.[key]);
    if (token) return token;
  }
  return undefined;
}

/**
 * Extracts a token from one auth entry.
 *
 * @param entry Auth entry to inspect.
 * @returns Token when present.
 */
function getAuthToken(entry: unknown): string | undefined {
  if (typeof entry === "string") return entry.trim() || undefined;
  if (!entry || typeof entry !== "object") return undefined;
  const record = entry as Record<string, unknown>;
  for (const key of ["access", "key", "refresh", "token"] as const) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}
