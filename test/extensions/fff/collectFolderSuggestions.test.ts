import assert from "node:assert/strict";
import test from "node:test";
import { collectFolderSuggestions } from "../../../packages/extension-core/src/fff/editor/collectFolderSuggestions.js";

test("collectFolderSuggestions derives matching folders from file candidates", () => {
  const folders = collectFolderSuggestions([
    {
      item: {
        path: "",
        relativePath: "packages/extension-core/src/fff/index.ts",
        fileName: "index.ts",
        totalFrecencyScore: 0,
        gitStatus: "clean",
      },
    },
    {
      item: {
        path: "",
        relativePath: "packages/extension-core/src/tron/index.ts",
        fileName: "index.ts",
        totalFrecencyScore: 0,
        gitStatus: "clean",
      },
    },
  ], "exten");

  assert.deepEqual(folders, ["src/extensions", "packages/extension-core/src/fff", "packages/extension-core/src/tron"]);
});

test("collectFolderSuggestions keeps nested folder matches unique and ordered", () => {
  const folders = collectFolderSuggestions([
    {
      item: {
        path: "",
        relativePath: "packages/extension-core/src/fff/runtime/FffRuntime.ts",
        fileName: "FffRuntime.ts",
        totalFrecencyScore: 0,
        gitStatus: "clean",
      },
    },
  ], "fff");

  assert.deepEqual(folders, ["packages/extension-core/src/fff", "packages/extension-core/src/fff/runtime"]);
});
