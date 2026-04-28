import assert from "node:assert/strict";
import test from "node:test";
import { detectProviderFromModel } from "../../packages/extensions/src/slashusage/providers/detectProviderFromModel.js";
import { parseMinimaxUsageResponse } from "../../packages/extensions/src/slashusage/providers/minimax/parseMinimaxUsageResponse.js";
import { selectUsagePair } from "../../packages/extensions/src/slashusage/model/selectUsagePair.js";
import type { UsageSnapshot } from "../../packages/extensions/src/slashusage/types.js";

test("detectProviderFromModel maps MiniMax Coding Plan providers", () => {
  assert.equal(detectProviderFromModel({ provider: "minimax-code", id: "MiniMax-M2.7" }), "minimax");
  assert.equal(detectProviderFromModel({ provider: "minimax-code-cn", id: "MiniMax-M2.7" }), "minimax-cn");
});

test("parseMinimaxUsageResponse parses current and weekly remains", () => {
  const windows = parseMinimaxUsageResponse({
    base_resp: { status_code: 0 },
    model_remains: [{
      model_name: "minimax-m2.7",
      current_interval_total_count: 100,
      current_interval_usage_count: 75,
      current_weekly_total_count: 1000,
      current_weekly_usage_count: 400,
    }],
  });

  assert.deepEqual(windows.map((window) => ({ label: window.label, usedPercent: window.usedPercent })), [
    { label: "5h", usedPercent: 25 },
    { label: "Week", usedPercent: 60 },
  ]);
});

test("selectUsagePair returns MiniMax daily and weekly slots", () => {
  const snapshot: UsageSnapshot = {
    provider: "minimax",
    fetchedAt: 0,
    windows: [
      { label: "5h", usedPercent: 25 },
      { label: "Week", usedPercent: 60 },
    ],
  };

  assert.deepEqual(selectUsagePair(snapshot, { provider: "minimax-code", id: "MiniMax-M2.7" }), {
    provider: "minimax",
    daily: 25,
    weekly: 60,
  });
});
