import assert from "node:assert/strict";
import test from "node:test";
import { FailedToolCallResult } from "../../../src/extensions/tron/compact-tool-lines/FailedToolCallResult.js";

const theme = {
  fg(color: string, text: string): string {
    return `[${color}]${text}[/${color}]`;
  },
  bold(text: string): string {
    return `[bold]${text}[/bold]`;
  },
};

test("failed tool call result applies error styling only to the error text", () => {
  const lines = new FailedToolCallResult("read", "Permission denied", theme).render(40);

  assert.equal(lines.length, 1);
  assert.match(lines[0], /^\[borderMuted\]│\[\/borderMuted\].*\[text\]\[bold\]read\[\/bold\]\[\/text\] \[error\]Permission denied\[\/error\] *\[borderMuted\]│\[\/borderMuted\]$/);
});
