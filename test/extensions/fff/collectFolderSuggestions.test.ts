import assert from "node:assert/strict";
import test from "node:test";
import { collectFolderSuggestions } from "../../../packages/extensions/src/fff/editor/collectFolderSuggestions.js";

test("collectFolderSuggestions derives matching folders from file candidates", () => {
  const folders = collectFolderSuggestions([
    {
      item: {
        path: "",
        relativePath: "packages/extensions/src/fff/index.ts",
        fileName: "index.ts",
        totalFrecencyScore: 0,
        gitStatus: "clean",
      },
    },
    {
      item: {
        path: "",
        relativePath: "packages/extensions/src/tron/index.ts",
        fileName: "index.ts",
        totalFrecencyScore: 0,
        gitStatus: "clean",
      },
    },
  ], "exten");

  assert.deepEqual(folders, ["src/extensions", "packages/extensions/src/fff", "packages/extensions/src/tron"]);
});

test("collectFolderSuggestions keeps nested folder matches unique and ordered", () => {
  const folders = collectFolderSuggestions([
    {
      item: {
        path: "",
        relativePath: "packages/extensions/src/fff/runtime/FffRuntime.ts",
        fileName: "FffRuntime.ts",
        totalFrecencyScore: 0,
        gitStatus: "clean",
      },
    },
  ], "fff");

  assert.deepEqual(folders, ["packages/extensions/src/fff", "packages/extensions/src/fff/runtime"]);
});
