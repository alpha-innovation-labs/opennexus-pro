import type { UsageHistoryRecord } from "./types.js";

/**
 * Creates the stable model storage key for one usage history record.
 *
 * @param record Usage history record.
 * @returns Provider-scoped model key.
 */
export function getUsageHistoryModelKey(record: UsageHistoryRecord): string {
	return `${record.provider}--${record.modelId ?? "all"}`;
}
