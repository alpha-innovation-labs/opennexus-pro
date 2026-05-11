import assert from "node:assert/strict";
import test from "node:test";
import { shortenPath } from "../../../packages/extension-core/src/tron/compact-tool-lines/shortenPath.js";
import { truncateSingleLineFromStart } from "../../../packages/extension-core/src/tron/compact-tool-lines/truncateSingleLineFromStart.js";

test("shortenPath keeps the end of long paths and truncates from the start", () => {
  const shortened = shortenPath(".worktrees/dual-chat-split-pane/src/feature/bootstrapPrimaryPaneFromBranch.ts");

  assert.equal(shortened.startsWith("…"), true);
  assert.equal(shortened.endsWith("bootstrapPrimaryPaneFromBranch.ts"), true);
});

test("truncateSingleLineFromStart keeps the end of long summaries", () => {
  const truncated = truncateSingleLineFromStart(
    "write .worktrees/dual-chat-split-pane/src/feature/bootstrapPrimaryPaneFromBranch.ts import type { SessionEntry } from '@nexus/pi-platform/sessionManager.js';",
    90,
  );

  assert.equal(truncated.startsWith("…"), true);
  assert.equal(truncated.includes("SessionEntry"), true);
});
