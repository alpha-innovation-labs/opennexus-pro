import type { UsageHistoryRecord } from "./types.js";

/**
 * Parses and validates one usage history JSONL row.
 *
 * @param line JSONL line.
 * @returns Parsed record or undefined.
 */
export function parseUsageHistoryRecord(line: string): UsageHistoryRecord | undefined {
  try {
    const record = JSON.parse(line) as UsageHistoryRecord;
    if (!record.provider || !record.label || !record.unit) return undefined;
    if (typeof record.sampledAt !== "number" || typeof record.value !== "number") return undefined;
    if (record.unit !== "percent" && record.unit !== "usd") return undefined;
    return record;
  } catch {
    return undefined;
  }
}
