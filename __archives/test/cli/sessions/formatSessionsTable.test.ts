import assert from "node:assert/strict";
import test from "node:test";
import { formatSessionsTable } from "../../../apps/tui/src/cli/sessions/formatSessionsTable.js";

test("formatSessionsTable renders a unicode CLI table", () => {
  const output = formatSessionsTable([
    { date: "2026-04-24 10:00:00", title: "Older", id: "older-id" },
    { date: "2026-04-24 11:00:00", title: "Newer", id: "newer-id" },
  ]);

  assert.match(output, /^┌/m);
  assert.match(output, /│ Date\s+│ Session title\s+│ Session ID\s+│/m);
  assert.match(output, /│ 2026-04-24 10:00:00 │ Older\s+│ older-id\s+│/m);
  assert.match(output, /│ 2026-04-24 11:00:00 │ Newer\s+│ newer-id\s+│/m);
  assert.match(output, /└/m);
});

test("formatSessionsTable wraps long titles to the terminal width", () => {
  const terminalWidth = 84;
  const output = formatSessionsTable(
    [
      {
        date: "2026-04-24 11:08:31",
        title: "[sub] Please provide one short, clean follow-up joke in French. Return only the joke.",
        id: "019dbe51-9605-7532-a134-d017872c652f",
      },
    ],
    { terminalWidth },
  );
  const lines = output.split("\n");

  assert.equal(lines.every((line) => line.length <= terminalWidth), true);
  assert.match(output, /│ \[sub\] Please/);
  assert.match(output, /│ [^│]*follow-up/);
  assert.match(output, /019dbe51-9605-7532-a134-d017872c652f/);
});
