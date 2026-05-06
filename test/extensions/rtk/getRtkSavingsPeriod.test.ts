import assert from "node:assert/strict";
import test from "node:test";
import { getRtkSavingsPeriod } from "../../../packages/extensions/src/rtk/savings/getRtkSavingsPeriod.js";
import type { RtkGainReport } from "../../../packages/extensions/src/rtk/savings/RtkGainReport.js";

const summary = { total_commands: 0, total_input: 0, total_output: 0, total_saved: 0, avg_savings_pct: 0, total_time_ms: 0, avg_time_ms: 0 };

test("getRtkSavingsPeriod returns rolling 30-day aggregate for monthly period", () => {
  const report: RtkGainReport = {
    daily: [
      { commands: 1, input_tokens: 10, output_tokens: 1, saved_tokens: 5, savings_pct: 50, total_time_ms: 10, avg_time_ms: 10, date: "2026-04-01" },
      { commands: 2, input_tokens: 20, output_tokens: 2, saved_tokens: 10, savings_pct: 50, total_time_ms: 20, avg_time_ms: 10, date: "2026-04-06" },
      { commands: 3, input_tokens: 30, output_tokens: 3, saved_tokens: 15, savings_pct: 50, total_time_ms: 30, avg_time_ms: 10, date: "2026-05-05" },
    ],
    monthly: [{ commands: 99, input_tokens: 990, output_tokens: 99, saved_tokens: 495, savings_pct: 50, total_time_ms: 990, avg_time_ms: 10, month: "2026-05" }],
    summary,
  };

  assert.deepEqual(getRtkSavingsPeriod(report, "monthly"), {
    commands: 5,
    input_tokens: 50,
    output_tokens: 5,
    saved_tokens: 25,
    savings_pct: 50,
    total_time_ms: 50,
    avg_time_ms: 10,
    date: "2026-04-06..2026-05-05",
  });
});
