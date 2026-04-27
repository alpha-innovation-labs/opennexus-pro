import assert from "node:assert/strict";
import test from "node:test";
import { RtkSavingsModal } from "../../../packages/extensions/src/rtk/ui/RtkSavingsModal.js";

test("RtkSavingsModal renders savings inside a framed modal", () => {
  const colors: string[] = [];
  const modal = new RtkSavingsModal({ fg: (color, value) => {
    colors.push(color);
    return value;
  } }, {
    daily: [{ commands: 1, input_tokens: 100, output_tokens: 20, saved_tokens: 80, savings_pct: 80, total_time_ms: 5, avg_time_ms: 5, date: "2026-04-27" }],
    monthly: [{ commands: 2, input_tokens: 1000, output_tokens: 250, saved_tokens: 750, savings_pct: 75, total_time_ms: 20, avg_time_ms: 10, month: "2026-04" }],
    summary: {
      total_commands: 2,
      total_input: 1000,
      total_output: 250,
      total_saved: 750,
      avg_savings_pct: 75,
      total_time_ms: 20,
      avg_time_ms: 10,
    },
    weekly: [{ commands: 2, input_tokens: 1000, output_tokens: 250, saved_tokens: 750, savings_pct: 75, total_time_ms: 20, avg_time_ms: 10, week_start: "2026-04-27", week_end: "2026-05-03" }],
  }, () => undefined);

  const output = modal.render(100).join("\n");

  assert.match(output, /┌/u);
  assert.match(output, /Token Savings/u);
  assert.doesNotMatch(output, /RTK Token Savings/u);
  assert.match(output, /Saved tokens\s+750/u);
  assert.match(output, /Today\s+80 · 80%/u);
  assert.match(output, /This week\s+750 · 75%/u);
  assert.match(output, /This month\s+750 · 75%/u);
  assert.match(output, /Efficiency\s+\[.*\]\s+75%/u);
  assert.ok(output.trim().split("\n").some((line) => /Efficiency\s+\[.*\]\s+75%/.test(line)));
  assert.doesNotMatch(output, /runtime/iu);
  assert.doesNotMatch(output, /Esc close/u);
  assert.doesNotMatch(output, /Saved .*tokens ·/u);
  assert.ok(colors.includes("success"));
  assert.ok(colors.includes("accent"));
});
