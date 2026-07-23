import type { UsageHistoryRecord } from "../history/types.js";
import { getUsageHistoryRecordModelId } from "./getUsageHistoryRecordModelId.js";
import { getUsageHistoryRecordModelLabel } from "./getUsageHistoryRecordModelLabel.js";

/** Model/subscription filter option used by the usage history modal. */
export type UsageHistoryModelOption = {
  id: string;
  label: string;
};

/**
 * Creates model/subscription filter options from usage history records.
 *
 * @param records Usage history records.
 * @returns Discovered model/subscription options.
 */
export function createUsageHistoryModelOptions(records: UsageHistoryRecord[]): UsageHistoryModelOption[] {
  const options = new Map<string, UsageHistoryModelOption>();
  for (const record of records) {
    const id = getUsageHistoryRecordModelId(record);
    options.set(id, { id, label: getUsageHistoryRecordModelLabel(record) });
  }
  return [...options.values()].sort((left, right) => left.label.localeCompare(right.label));
}
