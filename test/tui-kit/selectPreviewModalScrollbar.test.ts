import assert from "node:assert/strict";
import test from "node:test";
import { SelectPreviewModal } from "../../packages/tui-kit/src/modal/select/SelectPreviewModal.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

test("select preview modal does not render shared overflow scrollbar", () => {
  const originalRows = process.stdout.rows;
  Object.defineProperty(process.stdout, "rows", { configurable: true, value: 8 });
  try {
    const colors: string[] = [];
    const theme = {
      ...createTestTheme(),
      fg(color: string, value: string): string {
        colors.push(color);
        return value;
      },
    };
    const modal = new SelectPreviewModal(theme as never, () => {}, () => {}, undefined, {
      footerHintLines: [],
      fullScreen: false,
      leftTitle: "Left",
      rightTitle: "Right",
    } as never);
    modal.setItems([{ value: "one", label: "One" }] as never);
    modal.setRightLines(Array.from({ length: 40 }, (_, index) => `line ${index}`));

    const output = modal.render(80).join("\n");

    assert.equal(output.includes("┃"), false);
    assert.equal(colors.includes("border"), false);
  } finally {
    Object.defineProperty(process.stdout, "rows", { configurable: true, value: originalRows });
  }
});
