import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { appendUsageHistoryRecords } from "../../../packages/extensions/src/usage-meter/history/appendUsageHistoryRecords.js";
import { compactUsageHistorySeries, USAGE_HISTORY_MAX_POINTS_PER_SERIES } from "../../../packages/extensions/src/usage-meter/history/compactUsageHistorySeries.js";
import { createUsageHistoryRecords } from "../../../packages/extensions/src/usage-meter/history/createUsageHistoryRecord.js";
import { getUsageHistoryFilePath } from "../../../packages/extensions/src/usage-meter/history/getUsageHistoryFilePath.js";
import { readUsageHistoryRecords } from "../../../packages/extensions/src/usage-meter/history/readUsageHistoryRecords.js";
import { USAGE_HISTORY_SAMPLE_INTERVAL_MS, startUsageHistorySampler } from "../../../packages/extensions/src/usage-meter/history/startUsageHistorySampler.js";
import { stopUsageHistorySampler } from "../../../packages/extensions/src/usage-meter/history/stopUsageHistorySampler.js";
import { usageHistorySamplers } from "../../../packages/extensions/src/usage-meter/history/usageHistorySamplerState.js";
import { createUsageHistoryFooter } from "../../../packages/extensions/src/usage-meter/history-modal/createUsageHistoryFooter.js";
import { createUsageHistoryModelOptions } from "../../../packages/extensions/src/usage-meter/history-modal/createUsageHistoryModelOptions.js";
import { createUsageHistoryLines } from "../../../packages/extensions/src/usage-meter/history-modal/createUsageHistoryLines.js";
import { showUsageHistoryModal } from "../../../packages/extensions/src/usage-meter/history-modal/showUsageHistoryModal.js";
import { UsageHistoryModal } from "../../../packages/extensions/src/usage-meter/history-modal/UsageHistoryModal.js";

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

test("usage history compacts each series to at most 500 averaged points", async () => {
  await withUsageDataDir(async () => {
    const records = Array.from({ length: 520 }, (_value, index) => ({
      provider: "codex" as const,
      label: "Week",
      unit: "percent" as const,
      value: index,
      sampledAt: index,
      fetchedAt: index,
    }));

    await appendUsageHistoryRecords(records);
    const stored = await readUsageHistoryRecords();

    assert.ok(stored.length <= USAGE_HISTORY_MAX_POINTS_PER_SERIES);
    assert.equal(stored[0]?.value, 0.5);
    assert.equal(stored.at(-1)?.value, 519);
  });
});

test("usage history compacts series independently", () => {
  const compacted = compactUsageHistorySeries(Array.from({ length: 520 }, (_value, index) => ({
    provider: "codex" as const,
    label: "Week",
    unit: "percent" as const,
    value: index,
    sampledAt: index,
    fetchedAt: index,
  })));

  assert.ok(compacted.length <= USAGE_HISTORY_MAX_POINTS_PER_SERIES);
  assert.equal(compacted.at(-1)?.sampledAt, 519);
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

test("usage history footer renders model tabs", () => {
  const theme = { fg: (_color: string, value: string) => value };
  const options = createUsageHistoryModelOptions([
    { provider: "codex", label: "5h", unit: "percent", value: 1, sampledAt: 1, fetchedAt: 1 },
    { provider: "codex", label: "GPT-5.3-Codex-Spark 5h", unit: "percent", value: 1, sampledAt: 1, fetchedAt: 1 },
    { provider: "minimax", label: "5h", unit: "percent", value: 1, sampledAt: 1, fetchedAt: 1 },
  ]);
  assert.equal(createUsageHistoryFooter(options, 1, theme).join(""), "○ All │ ● codex │ ○ GPT-5.3-Codex-Spark │ ○ minimax");
});

test("usage history modal uses a full-width overlay backdrop", async () => {
  await withUsageDataDir(async () => {
    let options: unknown;
    await showUsageHistoryModal({
      ui: {
        custom: (_createModal: unknown, customOptions: unknown) => {
          options = customOptions;
        },
        setWidget() {},
      },
    } as never);

    assert.deepEqual(options, {
      overlay: true,
      overlayOptions: { anchor: "center", width: "100%", minWidth: 72, maxHeight: "85%" },
    });
  });
});

test("usage history modal tabs filter models", () => {
  const theme = { fg: (_color: string, value: string) => value };
  let renders = 0;
  const modal = new UsageHistoryModal(theme, [
    { provider: "codex", label: "5h", unit: "percent", value: 10, sampledAt: 1, fetchedAt: 1 },
    { provider: "codex", label: "Week", unit: "percent", value: 12, sampledAt: 1, fetchedAt: 1 },
    { provider: "minimax", label: "5h", unit: "percent", value: 20, sampledAt: 1, fetchedAt: 1 },
  ], () => undefined, () => { renders += 1; });

  assert.match(modal.render(100).join("\n"), /codex Week/);
  assert.doesNotMatch(modal.render(100).join("\n"), /minimax 5h/);
  assert.match(modal.render(100).join("\n"), /● 1W \[1\].*○ 5h \[2\]/s);
  modal.handleInput("2");
  assert.match(modal.render(100).join("\n"), /codex 5h/);
  assert.match(modal.render(100).join("\n"), /minimax 5h/);
  modal.handleInput("\t");
  assert.match(modal.render(100).join("\n"), /codex 5h/);
  assert.doesNotMatch(modal.render(100).join("\n"), /minimax 5h/);
  modal.handleInput("1");
  assert.match(modal.render(100).join("\n"), /codex Week/);
  assert.doesNotMatch(modal.render(100).join("\n"), /codex 5h/);
  assert.equal(renders, 3);
});

test("usage history graph renders latest values over time", () => {
  const lines = createUsageHistoryLines([
    { provider: "anthropic", label: "Week", unit: "percent", value: 10, sampledAt: Date.UTC(2026, 0, 1, 10, 0), fetchedAt: 1 },
    { provider: "anthropic", label: "Week", unit: "percent", value: 25, sampledAt: Date.UTC(2026, 0, 1, 10, 5), fetchedAt: 2 },
  ], 40);
  const output = lines.join("\n");

  assert.match(output, /anthropic Week · latest 25%/);
  assert.match(output, /100% │/);
  assert.match(output, / 95% │/);
  assert.match(output, /  5% │/);
  assert.match(output, /  0% │/);
  assert.match(output, /[\u2800-\u28ff]/u);
});
