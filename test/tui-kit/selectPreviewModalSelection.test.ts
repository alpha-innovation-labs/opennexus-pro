import assert from "node:assert/strict";
import test from "node:test";
import { renderSelectListLines } from "../../packages/tui-kit/src/modal/select/renderSelectListLines.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

test("selected left-pane item uses teal syntaxType color", () => {
  const colors: string[] = [];
  const theme = {
    ...createTestTheme(),
    fg(color: string, value: string): string {
      colors.push(color);
      return `<${color}>${value}</${color}>`;
    },
  };

  const lines = renderSelectListLines({
    items: [{ value: "one", label: "One" }, { value: "two", label: "Two" }] as never,
    maxVisible: 4,
    selectedIndex: 1,
    theme: theme as never,
    width: 20,
  });

  assert.equal(lines[1], " <syntaxType>Two</syntaxType>");
  assert.equal(colors.includes("accent"), false);
});
