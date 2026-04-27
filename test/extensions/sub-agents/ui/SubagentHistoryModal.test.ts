import test from "node:test";
import assert from "node:assert/strict";
import { SubagentHistoryModal } from "../../../../packages/extensions/src/sub-agents/ui/SubagentHistoryModal.js";

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
  italic: (text: string) => text,
};

/**
 * Verifies the modal follows the newest transcript content at the bottom.
 */
test("SubagentHistoryModal shows the latest transcript lines", () => {
  const originalRows = process.stdout.rows;
  Object.defineProperty(process.stdout, "rows", { value: 20, configurable: true });

  const modal = new SubagentHistoryModal(
    theme as any,
    [{
      id: "run-1",
      title: "Latest run",
      status: "completed",
      subagentType: "Explore",
      transcript: Array.from({ length: 40 }, (_item, index) => ({
        role: "assistant",
        text: `line-${index + 1}`,
        createdAt: Date.now() + index,
      })),
    } as any],
    () => {},
  );

  const lines = modal.render(120);
  assert.equal(lines.some((line) => line.includes("line-40")), true);
  assert.equal(lines.some((line) => line.includes("line-1")), false);

  Object.defineProperty(process.stdout, "rows", { value: originalRows, configurable: true });
});
