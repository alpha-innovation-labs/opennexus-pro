import { DEFAULT_COMPACTION_SETTINGS } from "@earendil-works/pi-coding-agent";

/**
 * Reads Pi's default compaction reserve from Pi's own compaction module.
 *
 * @returns Pi default reserve token count.
 */
export async function getPiDefaultCompactionReserveTokens(): Promise<number> {
  const reserveTokens = DEFAULT_COMPACTION_SETTINGS.reserveTokens;
  if (typeof reserveTokens === "number" && Number.isFinite(reserveTokens) && reserveTokens > 0) return reserveTokens;
  throw new Error("Pi DEFAULT_COMPACTION_SETTINGS.reserveTokens is unavailable");
}
