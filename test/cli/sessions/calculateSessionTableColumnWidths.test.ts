import assert from "node:assert/strict";
import test from "node:test";
import { calculateSessionTableColumnWidths } from "../../../src/cli/sessions/calculateSessionTableColumnWidths.js";

test("calculateSessionTableColumnWidths keeps the full session ID column when the terminal is wide enough", () => {
  assert.deepEqual(calculateSessionTableColumnWidths(100), {
    date: 21,
    title: 37,
    id: 38,
  });
});

test("calculateSessionTableColumnWidths wraps the session ID column when the terminal is very narrow", () => {
  assert.deepEqual(calculateSessionTableColumnWidths(60), {
    date: 21,
    title: 16,
    id: 19,
  });
});
