import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { appendUsageHistoryRecords } from "../../../packages/extension-core/src/slashusage/history/appendUsageHistoryRecords.js";
import { compactUsageHistorySeries, USAGE_HISTORY_MAX_POINTS_PER_SERIES } from "../../../packages/extension-core/src/slashusage/history/compactUsageHistorySeries.js";
import { getUsageHistoryFilePath } from "../../../packages/extension-core/src/slashusage/history/getUsageHistoryFilePath.js";
import { getUsageHistoryModelFilePath } from "../../../packages/extension-core/src/slashusage/history/getUsageHistoryModelFilePath.js";
import { readUsageHistoryRecords } from "../../../packages/extension-core/src/slashusage/history/readUsageHistoryRecords.js";
import { sanitizeUsageHistoryModelKey } from "../../../packages/extension-core/src/slashusage/history/sanitizeUsageHistoryModelKey.js";
import { selectChartPoints } from "../../../packages/extension-core/src/slashusage/history-modal/selectChartPoints.js";

/**
 * Runs a test with an isolated Nexus agent data dir.
 *
 * @param fn Test function.
 */
async function withUsageDataDir(fn: () => Promise<void>): Promise<void> {
  const previous = process.env.NEXUS_CODING_AGENT_DIR;
  const dir = await mkdtemp(join(tmpdir(), "nexus-usage-history-"));
  process.env.NEXUS_CODING_AGENT_DIR = dir;
  try {
    await fn();
  } finally {
    if (previous === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
    else process.env.NEXUS_CODING_AGENT_DIR = previous;
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Creates monotonically increasing percent records for one usage history series.
 *
 * @param count Number of records to create.
 * @returns Usage records with sampledAt matching their index.
 */
function createUsageRecords(count: number) {
  return createUsageRecordsFromStart(count, 0, 1);
}

/**
 * Creates usage records from a fixed start timestamp and interval.
 *
 * @param count Number of records to create.
 * @param start First sampledAt timestamp.
 * @param interval Milliseconds between records.
 * @returns Usage records spanning the requested range.
 */
function createUsageRecordsFromStart(count: number, start: number, interval: number) {
  return Array.from({ length: count }, (_value, index) => ({
    provider: "codex" as const,
    modelId: "gpt-5.5",
    label: "Week",
    unit: "percent" as const,
    value: index,
    sampledAt: start + index * interval,
    fetchedAt: start + index * interval,
  }));
}

test("slashusage stores one history file per provider-scoped model", async () => {
  await withUsageDataDir(async () => {
    await appendUsageHistoryRecords([
      { provider: "codex", modelId: "gpt-5.5", label: "Week", unit: "percent", value: 1, sampledAt: 1, fetchedAt: 1 },
      { provider: "minimax", modelId: "MiniMax-M2.7", label: "5h", unit: "percent", value: 2, sampledAt: 2, fetchedAt: 2 },
    ]);

    assert.match(await readFile(getUsageHistoryModelFilePath("codex--gpt-5.5"), "utf8"), /"modelId":"gpt-5.5"/);
    assert.match(await readFile(getUsageHistoryModelFilePath("minimax--MiniMax-M2.7"), "utf8"), /"modelId":"MiniMax-M2.7"/);
    assert.deepEqual((await readUsageHistoryRecords()).map((record) => record.modelId), ["gpt-5.5", "MiniMax-M2.7"]);
  });
});

test("slashusage model filenames are injective for slash and underscore model ids", () => {
  assert.notEqual(sanitizeUsageHistoryModelKey("minimax--MiniMaxAI/MiniMax-M2.7"), sanitizeUsageHistoryModelKey("minimax--MiniMaxAI_MiniMax-M2.7"));
});

test("usage history compacts each series to at most 1000 full-range averaged points", async () => {
  await withUsageDataDir(async () => {
    await appendUsageHistoryRecords(createUsageRecords(2_520));
    const stored = await readUsageHistoryRecords();

    assert.equal(stored.length, USAGE_HISTORY_MAX_POINTS_PER_SERIES);
    assert.equal(stored[0]?.value, 0);
    assert.equal(stored[0]?.sampledAt, 0);
    assert.equal(stored.at(-1)?.value, 2_519);
    assert.equal(stored.at(-1)?.sampledAt, 2_519);
  });
});

test("usage history compacts series independently", () => {
  const compacted = compactUsageHistorySeries(createUsageRecords(2_520));

  assert.equal(compacted.length, USAGE_HISTORY_MAX_POINTS_PER_SERIES);
  assert.equal(compacted[0]?.sampledAt, 0);
  assert.equal(compacted.at(-1)?.sampledAt, 2_519);
});

test("usage history compaction preserves a first data point from days ago", async () => {
  await withUsageDataDir(async () => {
    const sevenDaysAgo = Date.UTC(2026, 0, 1, 3, 0, 0);
    const fiveMinuteInterval = 5 * 60 * 1000;
    const records = createUsageRecordsFromStart(2_520, sevenDaysAgo, fiveMinuteInterval);

    await appendUsageHistoryRecords(records);
    const stored = await readUsageHistoryRecords();

    assert.equal(stored.length, USAGE_HISTORY_MAX_POINTS_PER_SERIES);
    assert.equal(stored[0]?.sampledAt, sevenDaysAgo);
    assert.equal(stored[0]?.value, 0);
    assert.equal(stored.at(-1)?.sampledAt, sevenDaysAgo + 2_519 * fiveMinuteInterval);
    assert.equal(stored.at(-1)?.value, 2_519);
  });
});

test("usage history reader loads legacy files from the first data point by default", async () => {
  await withUsageDataDir(async () => {
    const filePath = getUsageHistoryFilePath();
    await mkdir(join(filePath, ".."), { recursive: true });
    const records = createUsageRecords(1_200).map((record) => JSON.stringify(record));
    await writeFile(filePath, `${records.join("\n")}\n`, "utf8");

    const stored = await readUsageHistoryRecords();

    assert.equal(stored.length, 1_200);
    assert.equal(stored[0]?.sampledAt, 0);
    assert.equal(stored.at(-1)?.sampledAt, 1_199);
  });
});

test("usage history reader keeps older legacy points when per-model files exist", async () => {
  await withUsageDataDir(async () => {
    const legacyFilePath = getUsageHistoryFilePath();
    const modelFilePath = getUsageHistoryModelFilePath("codex--gpt-5.5");
    await mkdir(join(legacyFilePath, ".."), { recursive: true });
    await mkdir(join(modelFilePath, ".."), { recursive: true });
    await writeFile(legacyFilePath, `${createUsageRecordsFromStart(3, 100, 10).map((record) => JSON.stringify(record)).join("\n")}\n`, "utf8");
    await writeFile(modelFilePath, `${createUsageRecordsFromStart(3, 130, 10).map((record) => JSON.stringify(record)).join("\n")}\n`, "utf8");

    const stored = await readUsageHistoryRecords();

    assert.equal(stored.length, 6);
    assert.equal(stored[0]?.sampledAt, 100);
    assert.equal(stored.at(-1)?.sampledAt, 150);
  });
});

test("usage history chart selection resamples from the first data point", () => {
  const selected = selectChartPoints(createUsageRecords(2_520), 1_000);

  assert.equal(selected.length, 1_000);
  assert.equal(selected[0]?.sampledAt, 0);
  assert.equal(selected.at(-1)?.sampledAt, 2_519);
});

test("usage history chart selection preserves a multi-day start on narrow screens", () => {
  const threeDaysAgo = Date.UTC(2026, 0, 2, 3, 0, 0);
  const tenMinuteInterval = 10 * 60 * 1000;
  const selected = selectChartPoints(createUsageRecordsFromStart(2_520, threeDaysAgo, tenMinuteInterval), 80);

  assert.equal(selected.length, 80);
  assert.equal(selected[0]?.sampledAt, threeDaysAgo);
  assert.equal(selected[0]?.value, 0);
  assert.equal(selected.at(-1)?.sampledAt, threeDaysAgo + 2_519 * tenMinuteInterval);
  assert.equal(selected.at(-1)?.value, 2_519);
});
