import assert from "node:assert/strict";
import test from "node:test";
import { setThemeInstance } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/theme.js";
import { renderSkillInvocationMessage } from "../../../packages/extensions/src/tron/skill-invocation/renderSkillInvocationMessage.js";

/**
 * Creates a minimal skill invocation component stub.
 *
 * @param name Skill name.
 * @returns Component stub.
 */
function createSkillInvocationComponent(name: string): { skillBlock: { name: string } } {
  return { skillBlock: { name } };
}

/**
 * Removes ANSI escape sequences from rendered terminal output.
 *
 * @param text Styled terminal output.
 * @returns Plain terminal output.
 */
function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/gu, "");
}

test("tron skill invocation message uses the compact tool-call row", () => {
  setThemeInstance({ fg: (_color: string, text: string) => text, bg: (_color: string, text: string) => text, bold: (text: string) => text } as never);
  const output = stripAnsi(renderSkillInvocationMessage(createSkillInvocationComponent("impeccable") as never, 100).join("\n"));

  assert.match(output, /┌/u);
  assert.match(output, /│󰚄 skill impeccable\s+ctrl\+o to expand/u);
  assert.match(output, /└/u);
});

test("tron skill invocation message falls back when the skill name is missing", () => {
  setThemeInstance({ fg: (_color: string, text: string) => text, bg: (_color: string, text: string) => text, bold: (text: string) => text } as never);
  const output = stripAnsi(renderSkillInvocationMessage({ skillBlock: { name: "" } } as never, 100).join("\n"));

  assert.match(output, /│󰚄 skill skill\s+ctrl\+o to expand/u);
});
