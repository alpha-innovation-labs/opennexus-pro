import assert from "node:assert/strict";
import test from "node:test";
import { selectUsagePair } from "../../src/pi-slash-usage/model/selectUsagePair.js";
import type { UsageSnapshot } from "../../src/pi-slash-usage/types.js";

const codexSnapshot: UsageSnapshot = {
  provider: "codex",
  fetchedAt: 0,
  windows: [
    { label: "5h", usedPercent: 3 },
    { label: "Week", usedPercent: 17 },
    { label: "GPT-5.3-Codex-Spark 5h", usedPercent: 0 },
    { label: "GPT-5.3-Codex-Spark Week", usedPercent: 0 },
  ],
};

test("selectUsagePair falls back to generic Codex windows for GPT-5.5", () => {
  assert.deepEqual(selectUsagePair(codexSnapshot, { provider: "openai-codex", id: "gpt-5.5" }), {
    provider: "codex",
    daily: 3,
    weekly: 17,
  });
});

test("selectUsagePair keeps Spark-specific Codex windows for Spark models", () => {
  assert.deepEqual(selectUsagePair(codexSnapshot, { provider: "openai-codex", id: "gpt-5.3-codex-spark" }), {
    provider: "codex",
    daily: 0,
    weekly: 0,
  });
});
