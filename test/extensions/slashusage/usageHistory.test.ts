import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { appendUsageHistoryRecords } from "../../../packages/extension-core/src/slashusage/history/appendUsageHistoryRecords.js";
import { createUsageHistoryRecords } from "../../../packages/extension-core/src/slashusage/history/createUsageHistoryRecord.js";
import { getUsageHistoryFilePath } from "../../../packages/extension-core/src/slashusage/history/getUsageHistoryFilePath.js";
import { getUsageHistoryModelFilePath } from "../../../packages/extension-core/src/slashusage/history/getUsageHistoryModelFilePath.js";
import { getUsageHistoryModelKey } from "../../../packages/extension-core/src/slashusage/history/getUsageHistoryModelKey.js";
import { readUsageHistoryRecords } from "../../../packages/extension-core/src/slashusage/history/readUsageHistoryRecords.js";
import { USAGE_HISTORY_SAMPLE_INTERVAL_MS, startUsageHistorySampler } from "../../../packages/extension-core/src/slashusage/history/startUsageHistorySampler.js";
import { stopUsageHistorySampler } from "../../../packages/extension-core/src/slashusage/history/stopUsageHistorySampler.js";
import { usageHistorySamplers } from "../../../packages/extension-core/src/slashusage/history/usageHistorySamplerState.js";
import { createUsageHistoryFooter } from "../../../packages/extension-core/src/slashusage/history-modal/createUsageHistoryFooter.js";
import { createUsageHistoryModelOptions } from "../../../packages/extension-core/src/slashusage/history-modal/createUsageHistoryModelOptions.js";
import { createUsageHistoryLines } from "../../../packages/extension-core/src/slashusage/history-modal/createUsageHistoryLines.js";
import { showUsageHistoryModal } from "../../../packages/extension-core/src/slashusage/history-modal/showUsageHistoryModal.js";
import { UsageHistoryModal } from "../../../packages/extension-core/src/slashusage/history-modal/UsageHistoryModal.js";
import { clearUsageHistorySelectionState } from "../../../packages/extension-core/src/slashusage/history-modal/usageHistorySelectionState.js";

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
  assert.equal(records[0]?.resetAt, "2026-01-01T00:00:00.000Z");
});

test("usage history appends and reads jsonl records", async () => {
  await withUsageDataDir(async () => {
    const records = createUsageHistoryRecords({ provider: "anthropic", fetchedAt: 1, windows: [{ label: "Week", usedPercent: 7 }] }, { id: "claude" }, 2);
    await appendUsageHistoryRecords(records);

    assert.match(await readFile(getUsageHistoryModelFilePath(getUsageHistoryModelKey(records[0]!)), "utf8"), /"provider":"anthropic"/);
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

test("usage history footer renders model tabs", () => {
  clearUsageHistorySelectionState();
  const theme = { fg: (_color: string, value: string) => value };
  const options = createUsageHistoryModelOptions([
    { provider: "codex", label: "5h", unit: "percent", value: 1, sampledAt: 1, fetchedAt: 1 },
    { provider: "codex", label: "GPT-5.3-Codex-Spark 5h", unit: "percent", value: 1, sampledAt: 1, fetchedAt: 1 },
    { provider: "minimax", label: "5h", unit: "percent", value: 1, sampledAt: 1, fetchedAt: 1 },
  ]);
  assert.equal(createUsageHistoryFooter(options, 1, theme).join(""), "○ codex │ ● GPT-5.3-Codex-Spark │ ○ minimax");
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
  clearUsageHistorySelectionState();
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
  assert.doesNotMatch(modal.render(100).join("\n"), /minimax 5h/);
  modal.handleInput("\t");
  assert.match(modal.render(100).join("\n"), /minimax 5h/);
  assert.doesNotMatch(modal.render(100).join("\n"), /codex 5h/);
  modal.handleInput("1");
  assert.match(modal.render(100).join("\n"), /No usage history yet/);
  assert.doesNotMatch(modal.render(100).join("\n"), /codex Week/);
  assert.equal(renders, 3);
});

test("usage history graph renders latest values over time", () => {
  clearUsageHistorySelectionState();
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

test("usage history graph marks reset time and warns when usage is over pace", () => {
  clearUsageHistorySelectionState();
  const resetAt = Date.UTC(2026, 0, 1, 15, 0);
  const lines = createUsageHistoryLines([
    { provider: "anthropic", label: "5h", unit: "percent", value: 10, sampledAt: Date.UTC(2026, 0, 1, 10, 0), fetchedAt: 1, resetAt: new Date(resetAt).toISOString() },
    { provider: "anthropic", label: "5h", unit: "percent", value: 50, sampledAt: Date.UTC(2026, 0, 1, 11, 0), fetchedAt: 2, resetAt: new Date(resetAt).toISOString() },
  ], 60);
  const output = lines.join("\n");

  assert.doesNotMatch(lines[0]!, /reset in/);
  assert.doesNotMatch(lines[0]!, /over pace/);
  assert.match(lines.at(-1)!, /\x1b\[38;2;230;170;80m▰▱▱▱▱\x1b\[0m \x1b\[38;2;210;90;90m⚠ 50% \/ 20%\x1b\[0m · 4h/);
  assert.doesNotMatch(lines.at(-1)!, /limit in/);
  assert.doesNotMatch(lines.at(-1)!, /over pace/);
  assert.match(output, /\x1b\[38;2;210;90;90m┃/);
});

test("weekly usage graph shows reset countdown without date text", () => {
  clearUsageHistorySelectionState();
  const resetAt = Date.UTC(2026, 0, 8, 10, 0);
  const output = createUsageHistoryLines([
    { provider: "anthropic", label: "Week", unit: "percent", value: 8, sampledAt: Date.UTC(2026, 0, 1, 14, 0), fetchedAt: 1, resetAt: new Date(resetAt).toISOString() },
  ], 80).join("\n");

  assert.match(output, /\x1b\[38;2;125;214;198m▱▱▱▱▱\x1b\[0m \x1b\[38;2;125;214;198m8% \/ 14%\x1b\[0m · 6d/);
  assert.doesNotMatch(output, /resets in/);
  assert.doesNotMatch(output, /2026/);
  assert.doesNotMatch(output, /Jan/);
});

test("daily usage graph shows elapsed reset-window progress", () => {
  clearUsageHistorySelectionState();
  const resetAt = Date.UTC(2026, 0, 2, 0, 0);
  const output = createUsageHistoryLines([
    { provider: "codex", label: "Day", unit: "percent", value: 25, sampledAt: Date.UTC(2026, 0, 1, 6, 0), fetchedAt: 1, resetAt: new Date(resetAt).toISOString() },
  ], 80).join("\n");

  assert.match(output, /\x1b\[38;2;125;214;198m▰▱▱▱▱\x1b\[0m \x1b\[38;2;125;214;198m25% \/ 100%\x1b\[0m · 18h/);
});

test("usage history modal remembers last selected model and window", () => {
  clearUsageHistorySelectionState();
  const theme = { fg: (_color: string, value: string) => value };
  const records = [
    { provider: "codex" as const, label: "5h", unit: "percent" as const, value: 10, sampledAt: 1, fetchedAt: 1 },
    { provider: "minimax" as const, label: "5h", unit: "percent" as const, value: 20, sampledAt: 1, fetchedAt: 1 },
  ];
  const first = new UsageHistoryModal(theme, records, () => undefined, () => undefined);
  first.handleInput("2");
  first.handleInput("\t");

  const reopened = new UsageHistoryModal(theme, records, () => undefined, () => undefined);
  const output = reopened.render(100).join("\n");

  assert.match(output, /minimax 5h/);
  assert.doesNotMatch(output, /codex 5h/);
});

test("usage history graph coarsens percent labels to fit available height", () => {
  clearUsageHistorySelectionState();
  const records = [
    { provider: "anthropic" as const, label: "Week", unit: "percent" as const, value: 10, sampledAt: 1, fetchedAt: 1 },
    { provider: "anthropic" as const, label: "Week", unit: "percent" as const, value: 25, sampledAt: 2, fetchedAt: 2 },
  ];

  assert.match(createUsageHistoryLines(records, 40, 13).join("\n"), / 90% │/);
  assert.doesNotMatch(createUsageHistoryLines(records, 40, 13).join("\n"), / 95% │/);
  assert.match(createUsageHistoryLines(records, 40, 5).join("\n"), / 50% │/);
});

test("usage history modal fits the configured overlay height", () => {
  clearUsageHistorySelectionState();
  const theme = { fg: (_color: string, value: string) => value };
  const modal = new UsageHistoryModal(theme, [
    { provider: "anthropic", label: "Week", unit: "percent", value: 10, sampledAt: 1, fetchedAt: 1 },
    { provider: "anthropic", label: "Week", unit: "percent", value: 25, sampledAt: 2, fetchedAt: 2 },
  ], () => undefined, () => undefined, () => 18);

  assert.ok(modal.render(100).length <= Math.floor(18 * 0.85));
});
