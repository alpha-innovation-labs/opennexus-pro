import assert from "node:assert/strict";
import test from "node:test";
import { formatRtkSavings } from "../../../packages/extensions/src/rtk/savings/formatRtkSavings.js";
import { parseRtkGainJson } from "../../../packages/extensions/src/rtk/savings/parseRtkGainJson.js";

test("formatRtkSavings renders a compact Nexus savings summary from RTK gain JSON", () => {
  const report = parseRtkGainJson(JSON.stringify({
    summary: {
      total_commands: 5282,
      total_input: 37128402,
      total_output: 9940079,
      total_saved: 28267926,
      avg_savings_pct: 76.13558482802465,
      total_time_ms: 697240,
      avg_time_ms: 132,
    },
  }));

  assert.equal(
    formatRtkSavings(report),
    "RTK saved 28.3M tokens (76.1%)\n5,282 commands · 37.1M in → 9.9M out",
  );
});

test("parseRtkGainJson rejects malformed RTK gain output", () => {
  assert.throws(() => parseRtkGainJson('{"summary":{}}'), /valid summary/u);
});
