import assert from "node:assert/strict";
import test from "node:test";
import { locationToReadParams } from "../../../packages/extension-core/src/fff/read/locationToReadParams.js";

test("locationToReadParams derives an offset from a line location", () => {
  const result = locationToReadParams({
    query: "index",
    absolutePath: "/tmp/index.ts",
    relativePath: "index.ts",
    pathType: "file",
    location: { type: "line", line: 42 },
    candidates: [],
  }, undefined, undefined);

  assert.deepEqual(result, { offset: 42, limit: 80 });
});

test("locationToReadParams keeps explicit pagination arguments", () => {
  const result = locationToReadParams({
    query: "index",
    absolutePath: "/tmp/index.ts",
    relativePath: "index.ts",
    pathType: "file",
    location: { type: "line", line: 42 },
    candidates: [],
  }, 5, 12);

  assert.deepEqual(result, { offset: 5, limit: 12 });
});
