import assert from "node:assert/strict";
import test from "node:test";
import { renderTodoListLines } from "../../../packages/mini-apps/src/todo/ui/renderTodoListLines.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("todo list rendering works in the virtual terminal", async () => {
  const theme = createTestTheme();
  const items = [
    { id: "1", text: "Ship release", done: false, createdAt: 1, updatedAt: 1 },
    { id: "2", text: "Write docs", done: true, createdAt: 1, updatedAt: 1 },
  ];

  const viewport = await renderComponentInVirtualTerminal(
    () => new LinesComponent((width) => renderTodoListLines(theme, items, width, 4, 0, 0, null)),
  );

  const output = viewport.join("\n");
  assert.match(output, /Ship release/);
  assert.match(output, /Write docs/);
});
