import type { UsageHistoryRecord } from "../history/types.js";
import type { UsageHistoryModelOption } from "./createUsageHistoryModelOptions.js";
import { getUsageHistoryRecordModelId } from "./getUsageHistoryRecordModelId.js";

/**
 * Filters usage history records by selected model/subscription option.
 *
 * @param records Usage history records.
 * @param selectedModel Selected model/subscription option.
 * @returns Filtered usage history records.
 */
export function filterUsageHistoryRecordsByModel(records: UsageHistoryRecord[], selectedModel: UsageHistoryModelOption): UsageHistoryRecord[] {
  if (selectedModel.id === "all") return records;
  return records.filter((record) => getUsageHistoryRecordModelId(record) === selectedModel.id);
}
