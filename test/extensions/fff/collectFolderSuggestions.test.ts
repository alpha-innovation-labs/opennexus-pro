import assert from "node:assert/strict";
import test from "node:test";
import { collectFolderSuggestions } from "../../../src/extensions/fff/editor/collectFolderSuggestions.js";

test("collectFolderSuggestions derives matching folders from file candidates", () => {
  const folders = collectFolderSuggestions([
    {
      item: {
        path: "",
        relativePath: "src/extensions/fff/index.ts",
        fileName: "index.ts",
        totalFrecencyScore: 0,
        gitStatus: "clean",
      },
    },
    {
      item: {
        path: "",
        relativePath: "src/extensions/tron/index.ts",
        fileName: "index.ts",
        totalFrecencyScore: 0,
        gitStatus: "clean",
      },
    },
  ], "exten");

  assert.deepEqual(folders, ["src/extensions", "src/extensions/fff", "src/extensions/tron"]);
});

test("collectFolderSuggestions keeps nested folder matches unique and ordered", () => {
  const folders = collectFolderSuggestions([
    {
      item: {
        path: "",
        relativePath: "src/extensions/fff/runtime/FffRuntime.ts",
        fileName: "FffRuntime.ts",
        totalFrecencyScore: 0,
        gitStatus: "clean",
      },
    },
  ], "fff");

  assert.deepEqual(folders, ["src/extensions/fff", "src/extensions/fff/runtime"]);
});
