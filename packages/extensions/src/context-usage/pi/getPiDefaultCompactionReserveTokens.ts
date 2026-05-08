import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { getPiCodingAgentDistRoot } from "./getPiCodingAgentDistRoot.js";

interface PiCompactionModule {
  DEFAULT_COMPACTION_SETTINGS?: { reserveTokens?: number };
}

/**
 * Reads Pi's default compaction reserve from Pi's own compaction module.
 *
 * @returns Pi default reserve token count.
 */
export async function getPiDefaultCompactionReserveTokens(): Promise<number> {
  const modulePath = join(getPiCodingAgentDistRoot(), "core", "compaction", "compaction.js");
  const module = await import(pathToFileURL(modulePath).href) as PiCompactionModule;
  const reserveTokens = module.DEFAULT_COMPACTION_SETTINGS?.reserveTokens;
  if (typeof reserveTokens === "number" && Number.isFinite(reserveTokens) && reserveTokens > 0) return reserveTokens;
  throw new Error("Pi DEFAULT_COMPACTION_SETTINGS.reserveTokens is unavailable");
}
