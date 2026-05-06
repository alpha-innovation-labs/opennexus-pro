import assert from "node:assert/strict";
import test from "node:test";
import { createUsagePaceStatus } from "../../packages/extensions/src/slashusage/history-modal/createUsagePaceStatus.js";
import type { UsageHistoryRecord } from "../../packages/extensions/src/slashusage/history/types.js";

/**
 * Creates a percent usage history record for pace-status tests.
 *
 * @param sampledAt Sample timestamp in epoch milliseconds.
 * @param resetAt Reset timestamp in epoch milliseconds.
 * @returns Usage history record for a weekly percent window.
 */
function createWeeklyUsageRecord(sampledAt: number, resetAt: number): UsageHistoryRecord {
  return {
    label: "Week",
    value: 20,
    unit: "percent",
    sampledAt,
    resetAt: new Date(resetAt).toISOString(),
  };
}

test("createUsagePaceStatus calculates weekly expected usage from elapsed window time", () => {
  const resetAt = Date.UTC(2026, 0, 8, 0, 0, 0);
  const sampledAt = resetAt - (4 * 24 + 19) * 60 * 60 * 1000;

  assert.deepEqual(createUsagePaceStatus(createWeeklyUsageRecord(sampledAt, resetAt)), {
    expectedPercent: 32,
    usedPercent: 20,
  });
});
