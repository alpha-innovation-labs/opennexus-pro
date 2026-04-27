import assert from "node:assert/strict";
import test from "node:test";
import { ThinkingLabelBlock } from "../../../packages/extensions/src/tron/thinking/ThinkingLabelBlock.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

/**
 * Removes ANSI escape sequences from rendered test lines.
 *
 * @param value Rendered line.
 * @returns Plain line.
 */
function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}

test("thinking label block reuses cached lines for unchanged width", async () => {
  await initializePiThemes();
  const block = new ThinkingLabelBlock("Reviewed the relevant files", false);

  const first = block.render(80);
  const second = block.render(80);

  assert.equal(second, first);
});

test("thinking label block refreshes cached lines when width changes", async () => {
  await initializePiThemes();
  const block = new ThinkingLabelBlock("Reviewed the relevant files", false);

  const first = block.render(80);
  const second = block.render(40);

  assert.notEqual(second, first);
});

test("thinking label block does not close a previous tool when thinking is first", async () => {
  await initializePiThemes();
  const block = new ThinkingLabelBlock("Reviewed the relevant files", false, false);
  const lines = block.render(40).map(stripAnsi);

  assert.match(lines[0] ?? "", /^┌/);
  assert.doesNotMatch(lines[0] ?? "", /^└/);
});

test("thinking label block closes the previous tool only when connected from a tool", async () => {
  await initializePiThemes();
  const block = new ThinkingLabelBlock("Reviewed the relevant files", false, true);
  const lines = block.render(40).map(stripAnsi);

  assert.match(lines[0] ?? "", /^└/);
  assert.match(lines[1] ?? "", /^┌/);
});

test("thinking label block connects to following tools only when requested", async () => {
  await initializePiThemes();
  const standalone = new ThinkingLabelBlock("Reviewed the relevant files", false, false).render(40).map(stripAnsi);
  const connected = new ThinkingLabelBlock("Reviewed the relevant files", true, false).render(40).map(stripAnsi);

  assert.match(standalone.at(-1) ?? "", /^└/);
  assert.match(connected.at(-1) ?? "", /^├/);
});
