import assert from "node:assert/strict";
import test from "node:test";
import { renderPromptQueue } from "../../../packages/extension-core/src/prompt-queue/renderPromptQueue.js";

const theme = {
  fg(color: string, value: string): string {
    return `<${color}>${value}</${color}>`;
  },
};

test("prompt queue renders as a purple boxed panel", () => {
  const lines = renderPromptQueue(50, [{ id: "a", text: "hello", createdAt: 1 }], "a", true, theme as never);

  assert.match(lines[0], /<accent>╭/u);
  assert.match(lines.at(-1) ?? "", /<accent>╰/u);
});

test("prompt queue renders Queue title inside the top border", () => {
  const lines = renderPromptQueue(70, [{ id: "a", text: "hello", createdAt: 1 }], "a", true, theme as never);

  assert.match(lines[0], /<accent>╭─<\/accent> Queue /u);
  assert.doesNotMatch(lines.slice(1).join("\n"), /Queue/u);
});

test("prompt queue renders purple hotkeys separate from foreground labels", () => {
  const output = renderPromptQueue(70, [{ id: "a", text: "hello", createdAt: 1 }], "a", true, theme as never).join("\n");

  assert.match(output, /<accent>e<\/accent> edit/u);
  assert.match(output, /<accent>Enter<\/accent> send/u);
  assert.match(output, /<accent>dd<\/accent> delete/u);
  assert.doesNotMatch(output, /<accent>edit<\/accent>/u);
  assert.doesNotMatch(output, /<accent>send<\/accent>/u);
  assert.doesNotMatch(output, /<accent>delete<\/accent>/u);
});

test("prompt queue aligns to compact startup Neo editor width", () => {
  const lines = renderPromptQueue(120, [{ id: "a", text: "aligned", createdAt: 1 }], "a", true, theme as never, false);

  assert.match(lines[0], /^ {30}<accent>╭/u);
});

test("prompt queue focused selected message is unstyled white text", () => {
  const output = renderPromptQueue(50, [{ id: "a", text: "selected", createdAt: 1 }], "a", true, theme as never).join("\n");

  assert.match(output, /› selected/u);
  assert.doesNotMatch(output, /<dim>› selected/u);
});
