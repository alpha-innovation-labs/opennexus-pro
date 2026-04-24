import assert from "node:assert/strict";
import test from "node:test";
import { FailedToolCallResult } from "../../../src/extensions/tron/compact-tool-lines/FailedToolCallResult.js";

const theme = {
  fg(color: string, text: string): string {
    return `[${color}]${text}[/${color}]`;
  },
};

test("failed tool call result applies error styling only to the row content", () => {
  const lines = new FailedToolCallResult("read", "Permission denied", theme).render(40);

  assert.equal(lines.length, 1);
  assert.match(lines[0], /^\[borderMuted\]│\[\/borderMuted\]\[error\].*read Permission denied.*\[\/error\] *\[borderMuted\]│\[\/borderMuted\]$/);
});
