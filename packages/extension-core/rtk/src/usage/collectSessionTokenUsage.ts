import { readFile } from "node:fs/promises";
import type { RtkSavingsPeriodKey } from "../savings/RtkSavingsPeriodKey.js";
import { addTokenUsageTotals } from "./addTokenUsageTotals.js";
import { createEmptyTokenUsageTotals } from "./createEmptyTokenUsageTotals.js";
import { createTokenUsagePeriod } from "./createTokenUsagePeriod.js";
import { getNexusSessionRoot } from "./getNexusSessionRoot.js";
import { getPeriodKey } from "./getPeriodKey.js";
import { listJsonlFiles } from "./listJsonlFiles.js";
import { parseSessionUsageLine, type SessionUsageLine } from "./parseSessionUsageLine.js";
import type { TokenUsagePeriod } from "./TokenUsagePeriod.js";
import type { TokenUsageTotals } from "./TokenUsageTotals.js";
import type { TokenUsageReport } from "./TokenUsageReport.js";

/**
 * Collects token usage from Nexus session JSONL files.
 *
 * @param startDate Inclusive lower timestamp bound.
 * @param sessionRoot Optional session root override.
 * @returns Token usage report grouped by day, week, and month.
 */
export async function collectSessionTokenUsage(startDate: Date, sessionRoot = getNexusSessionRoot()): Promise<TokenUsageReport> {
  const periods = {
    daily: new Map<string, TokenUsagePeriod>(),
    monthly: new Map<string, TokenUsagePeriod>(),
    weekly: new Map<string, TokenUsagePeriod>(),
  };
  const modelTokens: Record<string, number> = {};
  const summary = createEmptyTokenUsageTotals();
  const files = await listJsonlFiles(sessionRoot);

  for (const file of files) await collectSessionFile(file, startDate, periods, summary, modelTokens);

  return {
    daily: [...periods.daily.values()].sort(sortByKey),
    monthly: [...periods.monthly.values()].sort(sortByKey),
    mostUsedModel: getMostUsedModel(modelTokens),
    summary,
    weekly: [...periods.weekly.values()].sort(sortByKey),
  };
}

/**
 * Collects usage from one JSONL file.
 *
 * @param file JSONL file path.
 * @param startDate Inclusive lower timestamp bound.
 * @param periods Mutable period maps.
 * @param summary Mutable summary total.
 * @param modelTokens Mutable model usage map.
 */
async function collectSessionFile(
  file: string,
  startDate: Date,
  periods: Record<RtkSavingsPeriodKey, Map<string, TokenUsagePeriod>>,
  summary: TokenUsageTotals,
  modelTokens: Record<string, number>,
): Promise<void> {
  const content = await readFile(file, "utf8").catch(() => "");
  for (const line of content.split("\n")) {
    const entry = parseSessionUsageLine(line);
    if (!entry || entry.timestamp < startDate) continue;
    addTokenUsageTotals(summary, entry.usage);
    if (entry.model) modelTokens[entry.model] = (modelTokens[entry.model] ?? 0) + entry.usage.total;
    for (const period of ["daily", "weekly", "monthly"] as const) addToPeriod(periods[period], period, entry);
  }
}

/**
 * Adds one usage entry to a period map.
 *
 * @param map Period map.
 * @param period Period key type.
 * @param entry Parsed usage entry.
 */
function addToPeriod(map: Map<string, TokenUsagePeriod>, period: RtkSavingsPeriodKey, entry: SessionUsageLine): void {
  const key = getPeriodKey(entry.timestamp, period);
  const bucket = map.get(key) ?? createTokenUsagePeriod(key);
  addTokenUsageTotals(bucket, entry.usage);
  if (entry.model) bucket.modelTokens[entry.model] = (bucket.modelTokens[entry.model] ?? 0) + entry.usage.total;
  map.set(key, bucket);
}

/**
 * Sorts period rows by their key.
 *
 * @param left Left period.
 * @param right Right period.
 * @returns Sort order.
 */
function sortByKey(left: TokenUsagePeriod, right: TokenUsagePeriod): number {
  return left.key.localeCompare(right.key);
}

/**
 * Gets the highest-token model id.
 *
 * @param modelTokens Model token totals.
 * @returns Most used model id.
 */
function getMostUsedModel(modelTokens: Record<string, number>): string | null {
  return Object.entries(modelTokens).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
