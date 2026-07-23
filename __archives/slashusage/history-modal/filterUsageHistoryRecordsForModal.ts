import type { UsageHistoryRecord } from "../history/types.js";
import { filterUsageHistoryRecordsByModel } from "./filterUsageHistoryRecordsByModel.js";
import { filterUsageHistoryRecordsByWindow } from "./filterUsageHistoryRecordsByWindow.js";
import type { UsageHistoryFilters } from "./types.js";

/**
 * Applies model and window filters to usage history records.
 *
 * @param records Usage history records.
 * @param filters Selected modal filters.
 * @returns Filtered records.
 */
export function filterUsageHistoryRecordsForModal(records: UsageHistoryRecord[], filters: UsageHistoryFilters): UsageHistoryRecord[] {
  return filterUsageHistoryRecordsByWindow(filterUsageHistoryRecordsByModel(records, filters.model), filters.window);
}
