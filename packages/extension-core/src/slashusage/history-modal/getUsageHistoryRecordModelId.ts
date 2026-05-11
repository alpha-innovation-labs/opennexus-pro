import type { UsageHistoryRecord } from "../history/types.js";
import { getUsageHistoryRecordModelLabel } from "./getUsageHistoryRecordModelLabel.js";

/**
 * Derives a stable model/subscription id for one usage history record.
 *
 * @param record Usage history record.
 * @returns Stable model/subscription id.
 */
export function getUsageHistoryRecordModelId(record: UsageHistoryRecord): string {
  return `${record.provider}:${getUsageHistoryRecordModelLabel(record).toLowerCase()}`;
}
