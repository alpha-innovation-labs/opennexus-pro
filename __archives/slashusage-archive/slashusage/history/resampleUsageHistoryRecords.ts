import { createUsageHistoryRecordWithAverages } from "./createUsageHistoryRecordWithAverages.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Resamples usage history records to a maximum point count while preserving the first and latest samples.
 *
 * @param records Records from one chart series.
 * @param maxPoints Maximum number of points to return.
 * @returns Resampled records spanning the full source range.
 */
export function resampleUsageHistoryRecords(records: UsageHistoryRecord[], maxPoints: number): UsageHistoryRecord[] {
	const sortedRecords = [...records].sort((left, right) => left.sampledAt - right.sampledAt);
	const normalizedMaxPoints = Math.max(0, Math.floor(maxPoints));
	if (normalizedMaxPoints === 0) return [];
	if (sortedRecords.length <= normalizedMaxPoints) return sortedRecords;
	if (normalizedMaxPoints === 1) return [sortedRecords[0]!];
	if (normalizedMaxPoints === 2) return [sortedRecords[0]!, sortedRecords[sortedRecords.length - 1]!];

	const firstRecord = sortedRecords[0]!;
	const latestRecord = sortedRecords[sortedRecords.length - 1]!;
	const middleRecordCount = sortedRecords.length - 2;
	const bucketCount = normalizedMaxPoints - 2;
	const sampledRecords: UsageHistoryRecord[] = [firstRecord];

	for (let bucketIndex = 0; bucketIndex < bucketCount; bucketIndex += 1) {
		const startIndex = 1 + Math.floor((bucketIndex * middleRecordCount) / bucketCount);
		const endIndex = 1 + Math.floor(((bucketIndex + 1) * middleRecordCount) / bucketCount);
		sampledRecords.push(createUsageHistoryRecordWithAverages(sortedRecords.slice(startIndex, Math.max(startIndex + 1, endIndex))));
	}

	sampledRecords.push(latestRecord);
	return sampledRecords;
}
