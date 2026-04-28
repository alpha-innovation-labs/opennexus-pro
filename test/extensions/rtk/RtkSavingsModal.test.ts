import assert from "node:assert/strict";
import test from "node:test";
import { RtkSavingsModal } from "../../../packages/extensions/src/rtk/ui/RtkSavingsModal.js";

test("RtkSavingsModal renders savings inside a framed modal with period tabs", () => {
  const colors: string[] = [];
  let renderRequests = 0;
  const modal = new RtkSavingsModal({ fg: (color, value) => {
    colors.push(color);
    return value;
  } }, {
    daily: [{ commands: 1, input_tokens: 100, output_tokens: 20, saved_tokens: 80, savings_pct: 80, total_time_ms: 5, avg_time_ms: 5, date: "2026-04-27" }],
    monthly: [{ commands: 3, input_tokens: 1200, output_tokens: 300, saved_tokens: 900, savings_pct: 75, total_time_ms: 30, avg_time_ms: 10, month: "2026-04" }],
    summary: {
      total_commands: 3,
      total_input: 1200,
      total_output: 300,
      total_saved: 900,
      avg_savings_pct: 75,
      total_time_ms: 30,
      avg_time_ms: 10,
    },
    weekly: [{ commands: 2, input_tokens: 1000, output_tokens: 250, saved_tokens: 750, savings_pct: 75, total_time_ms: 20, avg_time_ms: 10, week_start: "2026-04-27", week_end: "2026-05-03" }],
  }, () => undefined, () => { renderRequests += 1; });

  const dailyOutput = modal.render(100).join("\n");

  assert.match(dailyOutput, /┌/u);
  assert.match(dailyOutput, /Token Savings/u);
  assert.match(dailyOutput, /● Daily/u);
  assert.match(dailyOutput, /○ Weekly/u);
  assert.match(dailyOutput, /○ Monthly/u);
  assert.doesNotMatch(dailyOutput, /RTK Token Savings/u);
  assert.match(dailyOutput, /Daily saved\s+80/u);
  assert.match(dailyOutput, /Commands\s+1/u);
  assert.match(dailyOutput, /Efficiency\s+\[.*\]\s+80%/u);
  assert.equal(getMetricValueColumn(dailyOutput, "Daily saved"), getMetricValueColumn(dailyOutput, "Commands"));
  assert.equal(getMetricValueColumn(dailyOutput, "Daily saved"), getMetricValueColumn(dailyOutput, "Efficiency"));
  assert.doesNotMatch(dailyOutput, /runtime/iu);
  assert.doesNotMatch(dailyOutput, /Esc close/u);
  assert.doesNotMatch(dailyOutput, /Saved .*tokens ·/u);

  modal.handleInput("\t");
  const weeklyOutput = modal.render(100).join("\n");
  assert.match(weeklyOutput, /● Weekly/u);
  assert.match(weeklyOutput, /Weekly saved\s+750/u);
  assert.equal(getMetricValueColumn(weeklyOutput, "Weekly saved"), getMetricValueColumn(weeklyOutput, "Commands"));

  modal.handleInput("\t");
  const monthlyOutput = modal.render(100).join("\n");
  assert.match(monthlyOutput, /● Monthly/u);
  assert.match(monthlyOutput, /Monthly saved\s+900/u);
  assert.equal(renderRequests, 2);

  assert.ok(colors.includes("success"));
  assert.ok(colors.includes("accent"));
});

/**
 * Returns the visible column where a metric value starts.
 *
 * @param output Rendered modal output.
 * @param label Metric label.
 * @returns Zero-based value column.
 */
function getMetricValueColumn(output: string, label: string): number {
  const line = output.split("\n").find((row) => row.includes(label));
  assert.ok(line, `Missing ${label} row`);
  const labelEnd = line.indexOf(label) + label.length;
  return line.slice(labelEnd).search(/\S/u) + labelEnd;
}
