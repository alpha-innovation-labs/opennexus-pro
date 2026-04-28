import assert from "node:assert/strict";
import test from "node:test";
import { filterUsageRelevantFiles } from "../../scripts/codexbar-sync/filterUsageRelevantFiles.mjs";
import { parseCodexBarSyncArgs } from "../../scripts/codexbar-sync/parseCodexBarSyncArgs.mjs";

test("filterUsageRelevantFiles keeps CodexBar provider and usage files", () => {
  assert.deepEqual(filterUsageRelevantFiles([
    "Sources/CodexBarCore/Providers/MiniMax/MiniMaxUsageFetcher.swift",
    "Sources/CodexBarCore/OpenAIWeb/OpenAIDashboardFetcher.swift",
    "README.md",
  ]), [
    "Sources/CodexBarCore/Providers/MiniMax/MiniMaxUsageFetcher.swift",
    "Sources/CodexBarCore/OpenAIWeb/OpenAIDashboardFetcher.swift",
  ]);
});

test("parseCodexBarSyncArgs reads mark flag", () => {
  assert.deepEqual(parseCodexBarSyncArgs(["--mark"]), { mark: true });
});
