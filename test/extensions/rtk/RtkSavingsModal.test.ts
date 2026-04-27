import assert from "node:assert/strict";
import test from "node:test";
import { RtkSavingsModal } from "../../../packages/extensions/src/rtk/ui/RtkSavingsModal.js";

test("RtkSavingsModal renders savings inside a framed modal", () => {
  const colors: string[] = [];
  const modal = new RtkSavingsModal({ fg: (color, value) => {
    colors.push(color);
    return value;
  } }, {
    summary: {
      total_commands: 2,
      total_input: 1000,
      total_output: 250,
      total_saved: 750,
      avg_savings_pct: 75,
      total_time_ms: 20,
      avg_time_ms: 10,
    },
  }, () => undefined);

  const output = modal.render(100).join("\n");

  assert.match(output, /┌/u);
  assert.match(output, /RTK Token Savings/u);
  assert.match(output, /Saved tokens\s+750/u);
  assert.match(output, /Efficiency\s+\[.*\]\s+75%/u);
  assert.ok(output.trim().split("\n").some((line) => /Efficiency\s+\[.*\]\s+75%/.test(line)));
  assert.doesNotMatch(output, /runtime/iu);
  assert.match(output, /Esc close/u);
  assert.ok(colors.includes("success"));
  assert.ok(colors.includes("accent"));
});
