import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { appendUsageHistoryRecords } from "../../../packages/extensions/src/usage-meter/history/appendUsageHistoryRecords.js";
import { createUsageHistoryRecords } from "../../../packages/extensions/src/usage-meter/history/createUsageHistoryRecord.js";
import { getUsageHistoryFilePath } from "../../../packages/extensions/src/usage-meter/history/getUsageHistoryFilePath.js";
import { readUsageHistoryRecords } from "../../../packages/extensions/src/usage-meter/history/readUsageHistoryRecords.js";
import { USAGE_HISTORY_SAMPLE_INTERVAL_MS, startUsageHistorySampler } from "../../../packages/extensions/src/usage-meter/history/startUsageHistorySampler.js";
import { stopUsageHistorySampler } from "../../../packages/extensions/src/usage-meter/history/stopUsageHistorySampler.js";
import { usageHistorySamplers } from "../../../packages/extensions/src/usage-meter/history/usageHistorySamplerState.js";
import { createUsageHistoryLines } from "../../../packages/extensions/src/usage-meter/history-modal/createUsageHistoryLines.js";

/**
 * Runs a test with an isolated Nexus agent data dir.
 *
 * @param fn Test function.
 */
async function withUsageDataDir(fn: (dir: string) => Promise<void>): Promise<void> {
  const previous = process.env.NEXUS_CODING_AGENT_DIR;
  const dir = await mkdtemp(join(tmpdir(), "nexus-usage-history-"));
  process.env.NEXUS_CODING_AGENT_DIR = dir;
  try {
    await fn(dir);
  } finally {
    if (previous === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
    else process.env.NEXUS_CODING_AGENT_DIR = previous;
    await rm(dir, { recursive: true, force: true });
  }
}

test("usage history snapshots are stored under XDG Nexus agent data", async () => {
  await withUsageDataDir(async (dir) => {
    assert.equal(getUsageHistoryFilePath(), join(dir, "usage-history", "usage-snapshots.jsonl"));
  });
});

test("usage history records preserve percent and usd units", () => {
  const records = createUsageHistoryRecords({
    provider: "codex",
    fetchedAt: 123,
    windows: [
      { label: "Week", usedPercent: 42, resetAt: "2026-01-01T00:00:00.000Z" },
      { label: "Billing", usedPercent: 0, usedAmountUsd: 12.34 },
    ],
  }, { id: "gpt-5" }, 456);

  assert.deepEqual(records.map((record) => [record.label, record.unit, record.value]), [["Week", "percent", 42], ["Billing", "usd", 12.34]]);
});

test("usage history appends and reads jsonl records", async () => {
  await withUsageDataDir(async () => {
    const records = createUsageHistoryRecords({ provider: "anthropic", fetchedAt: 1, windows: [{ label: "Week", usedPercent: 7 }] }, { id: "claude" }, 2);
    await appendUsageHistoryRecords(records);

    assert.match(await readFile(getUsageHistoryFilePath(), "utf8"), /"provider":"anthropic"/);
    assert.deepEqual(await readUsageHistoryRecords(), records);
  });
});

test("usage history sampling interval is five minutes", () => {
  assert.equal(USAGE_HISTORY_SAMPLE_INTERVAL_MS, 5 * 60 * 1000);
});

test("usage history sampler starts and stops a session interval", () => {
  const cwd = "/tmp/nexus-usage-sampler-test";
  startUsageHistorySampler(cwd, { cwd, model: undefined } as never, 10_000);
  assert.ok(usageHistorySamplers.get(cwd));
  stopUsageHistorySampler(cwd);
  assert.equal(usageHistorySamplers.get(cwd), undefined);
});

test("usage history graph renders latest values", () => {
  const lines = createUsageHistoryLines([
    { provider: "anthropic", label: "Week", unit: "percent", value: 10, sampledAt: 1, fetchedAt: 1 },
    { provider: "anthropic", label: "Week", unit: "percent", value: 25, sampledAt: 2, fetchedAt: 2 },
  ], 40);

  assert.match(lines.join("\n"), /anthropic Week/);
  assert.match(lines.join("\n"), /25%/);
});
