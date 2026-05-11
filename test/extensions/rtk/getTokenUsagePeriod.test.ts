import assert from "node:assert/strict";
import test from "node:test";
import { getTokenUsagePeriod } from "../../../packages/extensions-pro/src/rtk/usage/getTokenUsagePeriod.js";
import type { TokenUsageReport } from "../../../packages/extensions-pro/src/rtk/usage/TokenUsageReport.js";

const summary = { cacheRead: 0, cacheWrite: 0, input: 0, output: 0, total: 0 };

test("getTokenUsagePeriod returns rolling 30-day aggregate for monthly period", () => {
  const report: TokenUsageReport = {
    daily: [
      { cacheRead: 1, cacheWrite: 2, input: 10, key: "2026-04-01", modelTokens: { old: 11 }, output: 1, total: 11 },
      { cacheRead: 3, cacheWrite: 4, input: 20, key: "2026-04-06", modelTokens: { a: 24 }, output: 2, total: 22 },
      { cacheRead: 5, cacheWrite: 6, input: 30, key: "2026-05-05", modelTokens: { a: 10, b: 26 }, output: 3, total: 33 },
    ],
    monthly: [{ cacheRead: 99, cacheWrite: 99, input: 990, key: "2026-05", modelTokens: {}, output: 99, total: 1089 }],
    mostUsedModel: null,
    summary,
    weekly: [],
  };

  assert.deepEqual(getTokenUsagePeriod(report, "monthly"), {
    cacheRead: 8,
    cacheWrite: 10,
    input: 50,
    key: "2026-04-06..2026-05-05",
    modelTokens: { a: 34, b: 26 },
    output: 5,
    total: 55,
  });
});
