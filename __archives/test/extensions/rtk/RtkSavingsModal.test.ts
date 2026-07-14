import assert from "node:assert/strict";
import test from "node:test";
import { RtkSavingsModal } from "../../../packages/extensions-pro/src/rtk/ui/RtkSavingsModal.js";

test("RtkSavingsModal renders savings inside a framed modal with period tabs", () => {
  const colors: string[] = [];
  let renderRequests = 0;
  const modal = new RtkSavingsModal({ fg: (color, value) => {
    colors.push(color);
    return value;
  } }, {
    daily: [
      { commands: 1, input_tokens: 500, output_tokens: 50, saved_tokens: 500, savings_pct: 100, total_time_ms: 5, avg_time_ms: 5, date: "2026-03-20" },
      { commands: 1, input_tokens: 20, output_tokens: 5, saved_tokens: 20, savings_pct: 100, total_time_ms: 5, avg_time_ms: 5, date: "2026-04-01" },
      { commands: 1, input_tokens: 100, output_tokens: 20, saved_tokens: 80, savings_pct: 80, total_time_ms: 5, avg_time_ms: 5, date: "2026-04-27" },
    ],
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
  assert.match(dailyOutput, /○ 30 days/u);
  assert.doesNotMatch(dailyOutput, /RTK Token Savings/u);
  assert.match(dailyOutput, /Total input\s+100/u);
  assert.match(dailyOutput, /Total output\s+20/u);
  assert.match(dailyOutput, /Nexus input saved\s+80/u);
  assert.match(dailyOutput, /Saved share\s+\[.*\]\s+40%/u);
  assert.equal(getMetricValueColumn(dailyOutput, "Total input"), getMetricValueColumn(dailyOutput, "Total output"));
  assert.equal(getMetricValueColumn(dailyOutput, "Total input"), getMetricValueColumn(dailyOutput, "Saved share"));
  assert.doesNotMatch(dailyOutput, /runtime/iu);
  assert.doesNotMatch(dailyOutput, /Esc close/u);
  assert.doesNotMatch(dailyOutput, /Saved .*tokens ·/u);

  modal.handleInput("\t");
  const weeklyOutput = modal.render(100).join("\n");
  assert.match(weeklyOutput, /● Weekly/u);
  assert.match(weeklyOutput, /Nexus input saved\s+750/u);
  assert.equal(getMetricValueColumn(weeklyOutput, "Nexus input saved"), getMetricValueColumn(weeklyOutput, "Saved share"));

  modal.handleInput("\t");
  const monthlyOutput = modal.render(100).join("\n");
  assert.match(monthlyOutput, /● 30 days/u);
  assert.match(monthlyOutput, /Nexus input saved\s+100/u);
  assert.equal(renderRequests, 2);

  assert.ok(colors.includes("success"));
  assert.ok(colors.includes("accent"));
});

test("RtkSavingsModal switches only between pre-priced OpenRouter models", () => {
  const colors: string[] = [];
  const modal = new RtkSavingsModal({ fg: (color, value) => {
    colors.push(color);
    return value;
  } }, {
    availableModels: [
      { id: "openai/gpt-5.5", label: "GPT 5.5", pricing: { cachedInput: 0.0000005, input: 0.000005, modelId: "openai/gpt-5.5", output: 0.00003 } },
      { id: "moonshotai/kimi-k2.5", label: "Kimi K2.5", pricing: { cachedInput: 0.00000022, input: 0.00000044, modelId: "moonshotai/kimi-k2.5", output: 0.000002 } },
    ],
    pricing: { cachedInput: 0.0000005, input: 0.000005, modelId: "openai/gpt-5.5", output: 0.00003 },
    pricingModelId: "openai/gpt-5.5",
    rtk: {
      daily: [{ commands: 1, input_tokens: 1000, output_tokens: 500, saved_tokens: 750, savings_pct: 75, total_time_ms: 20, avg_time_ms: 10, date: "2026-04-27" }],
      summary: { total_commands: 1, total_input: 1000, total_output: 500, total_saved: 750, avg_savings_pct: 75, total_time_ms: 20, avg_time_ms: 10 },
    },
    usage: { daily: [{ cacheRead: 0, cacheWrite: 0, input: 1000, key: "2026-04-27", modelTokens: {}, output: 500, total: 1500 }], monthly: [], mostUsedModel: null, summary: { cacheRead: 0, cacheWrite: 0, input: 1000, output: 500, total: 1500 }, weekly: [] },
  }, () => undefined);

  modal.handleInput("m");
  modal.handleInput("j");
  modal.handleInput("\r");
  const output = modal.render(100).join("\n");

  assert.match(output, /OpenRouter moonshotai\/kimi-k2\.5 \(m\)/u);
  assert.match(output, /Total cost\s+\$0\.00/u);
  assert.match(output, /Nexus \$ saved\s+\$0\.00/u);
  assert.ok(colors.includes("error"));
  assert.ok(colors.includes("success"));
});

test("RtkSavingsModal opens filterable model pricing panel with m marker", () => {
  const modal = new RtkSavingsModal({ fg: (_color, value) => value }, {
    availableModels: [
      { id: "openai/gpt-5.5", label: "GPT 5.5", pricing: { cachedInput: 0.0000005, input: 0.000005, modelId: "openai/gpt-5.5", output: 0.00003 } },
      { id: "moonshotai/kimi-k2.5", label: "Kimi K2.5", pricing: { cachedInput: 0.00000022, input: 0.00000044, modelId: "moonshotai/kimi-k2.5", output: 0.000002 } },
      ...Array.from({ length: 20 }, (_, index) => ({ id: `provider/model-${index}`, label: `Extra Model ${index}`, pricing: { cachedInput: 0, input: 0, modelId: `provider/model-${index}`, output: 0 } })),
    ],
    pricingModelId: "openai/gpt-5.5",
    rtk: {
      daily: [{ commands: 1, input_tokens: 100, output_tokens: 20, saved_tokens: 80, savings_pct: 80, total_time_ms: 5, avg_time_ms: 5, date: "2026-04-27" }],
      summary: { total_commands: 1, total_input: 100, total_output: 20, total_saved: 80, avg_savings_pct: 80, total_time_ms: 5, avg_time_ms: 5 },
    },
  }, () => undefined);

  modal.handleInput("m");
  const output = modal.render(100).join("\n");

  assert.match(output, /Pricing model/u);
  assert.match(output, /GPT 5\.5 \(m\)/u);
  assert.match(output, /Filter: type to filter/u);
  assert.ok(output.split("\n").length < 20);

  modal.handleInput("K");
  modal.handleInput("i");
  const filteredOutput = modal.render(100).join("\n");

  assert.match(filteredOutput, /Kimi K2\.5/u);
  assert.doesNotMatch(filteredOutput, /Extra Model/u);
  assert.match(filteredOutput, /Filter: Ki/u);
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
