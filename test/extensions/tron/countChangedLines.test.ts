import assert from "node:assert/strict";
import test from "node:test";
import { countChangedLines } from "../../../src/extensions/tron/compact-tool-lines/countChangedLines.js";

test("countChangedLines totals added and removed lines across all edit blocks", () => {
  assert.deepEqual(
    countChangedLines({
      edits: [
        { oldText: "one\ntwo", newText: "one\ntwo\nthree" },
        { oldText: "alpha", newText: "beta\ngamma" },
      ],
    }),
    { added: 5, removed: 3 },
  );
});
