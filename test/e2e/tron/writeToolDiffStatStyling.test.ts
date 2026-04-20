import assert from "node:assert/strict";
import test from "node:test";
import { registerToolActivityGroup } from "../../../src/extensions/tron/activity/registerToolActivityGroup.js";
import { renderSummary } from "../../../src/extensions/tron/compact-tool-lines/renderSummary.js";
import { summarizeArgs } from "../../../src/extensions/tron/compact-tool-lines/summarizeArgs.js";

/**
 * Removes ANSI escape sequences from rendered terminal lines.
 *
 * @param line Rendered terminal line.
 * @returns Plain visible text.
 */
function stripAnsi(line: string): string {
  return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

test("tron write tool renders git-style added stats next to the tool label", () => {
  registerToolActivityGroup(["write-1"]);

  const component = renderSummary(
    "write-1",
    "write",
    summarizeArgs("write", {
      path: "src/app/page.tsx",
      content: "line a\nline b\nline c",
    }),
    {
      fg(color: string, value: string): string {
        if (color === "syntaxType") return `\u001b[36m${value}\u001b[0m`;
        if (color === "error") return `\u001b[31m${value}\u001b[0m`;
        return value;
      },
      bold(value: string): string {
        return value;
      },
    },
    false,
  );

  const rawLine = component.render(120).find((line) => line.includes("src/app/page.tsx"));
  assert.ok(rawLine, "expected rendered write tool line");
  assert.match(rawLine, /write \u001b\[36m\+3\u001b\[0m \u001b\[31m-0\u001b\[0m .*src\/app\/page\.tsx/);

  const plainLine = stripAnsi(rawLine);
  assert.match(plainLine, /write \+3 -0 .*src\/app\/page\.tsx/);
});
