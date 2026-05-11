import { clampPercent } from "../../shared/clampPercent.js";
import { formatResetTime } from "../../shared/formatResetTime.js";
import type { RateWindow } from "../../types.js";

type MiniMaxUsageWindow = {
  current_interval_total_count?: unknown;
  current_interval_usage_count?: unknown;
  current_weekly_total_count?: unknown;
  current_weekly_usage_count?: unknown;
  end_time?: unknown;
  remains_time?: unknown;
  weekly_end_time?: unknown;
};

/**
 * Parses a MiniMax Coding Plan remains response into usage windows.
 *
 * @param data MiniMax API response payload.
 * @returns Usage windows for current interval and weekly limits.
 */
export function parseMinimaxUsageResponse(data: unknown): RateWindow[] {
  const payload = unwrapMiniMaxPayload(data);
  const status = getNumber(payload?.base_resp?.status_code);
  if (status !== undefined && status !== 0) throw new Error(String(payload?.base_resp?.status_msg ?? `API ${status}`));
  const modelRemains = Array.isArray(payload?.model_remains) ? payload.model_remains : [];
  const bucket = pickTextModelBucket(modelRemains);
  if (!bucket) return [];
  return [
    createUsageWindow("5h", bucket.current_interval_total_count, bucket.current_interval_usage_count, bucket.end_time ?? bucket.remains_time),
    createUsageWindow("Week", bucket.current_weekly_total_count, bucket.current_weekly_usage_count, bucket.weekly_end_time),
  ].filter((window): window is RateWindow => Boolean(window));
}

/**
 * Unwraps MiniMax responses that place data under a `data` object.
 *
 * @param data Response payload.
 * @returns Normalized response object.
 */
function unwrapMiniMaxPayload(data: unknown): Record<string, any> | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, any>;
  return record.data && typeof record.data === "object" ? record.data : record;
}

/**
 * Picks the MiniMax text model quota bucket.
 *
 * @param buckets Model quota buckets.
 * @returns Best matching bucket.
 */
function pickTextModelBucket(buckets: unknown[]): MiniMaxUsageWindow | undefined {
  return buckets.find(isMiniMaxTextBucket) as MiniMaxUsageWindow | undefined ?? buckets[0] as MiniMaxUsageWindow | undefined;
}

/**
 * Checks whether a quota bucket belongs to a MiniMax text model.
 *
 * @param bucket Candidate quota bucket.
 * @returns True when it is a MiniMax text bucket.
 */
function isMiniMaxTextBucket(bucket: unknown): boolean {
  if (!bucket || typeof bucket !== "object") return false;
  const name = String((bucket as { model_name?: unknown }).model_name ?? "").toLowerCase();
  return name.startsWith("minimax-m") || name.includes("minimax");
}

/**
 * Creates a usage window from total and remaining values.
 *
 * @param label Usage window label.
 * @param total Raw total allowance.
 * @param remaining Raw remaining allowance.
 * @param reset Raw reset timestamp or duration.
 * @returns Usage window when values are valid.
 */
function createUsageWindow(label: string, total: unknown, remaining: unknown, reset: unknown): RateWindow | undefined {
  const totalCount = getNumber(total);
  const remainingCount = getNumber(remaining);
  if (!totalCount || remainingCount === undefined) return undefined;
  const resetAt = getResetAt(reset);
  return {
    label,
    usedPercent: clampPercent(((totalCount - remainingCount) / totalCount) * 100),
    resetAt,
    resetDescription: resetAt ? formatResetTime(resetAt) : undefined,
  };
}

/**
 * Converts MiniMax number-like values to numbers.
 *
 * @param value Raw value.
 * @returns Parsed number.
 */
function getNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Converts MiniMax reset values to an ISO timestamp.
 *
 * @param value Raw timestamp or duration.
 * @returns ISO timestamp.
 */
function getResetAt(value: unknown): string | undefined {
  const raw = getNumber(value);
  if (!raw || raw <= 0) return undefined;
  if (raw > 1_000_000_000_000) return new Date(raw).toISOString();
  if (raw > 1_000_000_000) return new Date(raw * 1000).toISOString();
  return new Date(Date.now() + (raw > 1_000_000 ? raw : raw * 1000)).toISOString();
}
