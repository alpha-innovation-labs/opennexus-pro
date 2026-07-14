import assert from "node:assert/strict";
import test from "node:test";
import { createFffAutocompleteProvider } from "../../../packages/extension-core/src/fff/editor/createFffAutocompleteProvider.js";

function createBaseProvider() {
  return {
    async getSuggestions() {
      return { prefix: "", items: [] };
    },
    applyCompletion(lines: string[], cursorLine: number, _cursorCol: number, item: { value: string }, prefix: string) {
      const line = lines[cursorLine] ?? "";
      const start = line.lastIndexOf(prefix);
      const nextLine = `${line.slice(0, start)}${item.value}${line.slice(start + prefix.length)}`;
      return { lines: [nextLine], cursorLine, cursorCol: nextLine.length };
    },
    shouldTriggerFileCompletion() {
      return true;
    },
  };
}

test("createFffAutocompleteProvider returns fuzzy @ file suggestions", async () => {
  const tracked: Array<{ query: string; selectedPath: string }> = [];
  const runtime = {
    async searchFileCandidates() {
      return [
        {
          item: { path: "", relativePath: "packages/extension-core/src/fff/index.ts", fileName: "index.ts", totalFrecencyScore: 0, gitStatus: "clean" },
          score: { matchType: "prefix" },
        },
      ];
    },
    async trackQuery(query: string, selectedPath: string) {
      tracked.push({ query, selectedPath });
    },
  };

  const provider = createFffAutocompleteProvider(createBaseProvider() as never, runtime as never);
  const suggestions = await provider.getSuggestions(["please inspect @fff/ind"], 0, 23, { signal: new AbortController().signal, force: false });

  assert.equal(suggestions?.prefix, "@fff/ind");
  assert.equal(suggestions?.items[0]?.value, "@packages/extension-core/src/fff/index.ts");
  provider.applyCompletion(["please inspect @fff/ind"], 0, 23, suggestions!.items[0]!, suggestions!.prefix!);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(tracked, [{ query: "@fff/ind", selectedPath: "packages/extension-core/src/fff/index.ts" }]);
});

test("createFffAutocompleteProvider preserves quoted paths with spaces", async () => {
  const runtime = {
    async searchFileCandidates() {
      return [
        {
          item: { path: "", relativePath: "folder with spaces/file.ts", fileName: "file.ts", totalFrecencyScore: 0, gitStatus: "clean" },
          score: { matchType: "prefix" },
        },
      ];
    },
    async trackQuery() {},
  };

  const provider = createFffAutocompleteProvider(createBaseProvider() as never, runtime as never);
  const suggestions = await provider.getSuggestions(["open @\"folder wi"], 0, 16, { signal: new AbortController().signal, force: false });

  assert.equal(suggestions?.items[0]?.value, '@"folder with spaces"');
  assert.equal(suggestions?.items[1]?.value, '@"folder with spaces/file.ts"');
});

test("createFffAutocompleteProvider falls back to the base provider when FFF search fails", async () => {
  const baseProvider = {
    async getSuggestions() {
      return { prefix: "@src", items: [{ value: "@fallback.ts", label: "fallback" }] };
    },
    applyCompletion: createBaseProvider().applyCompletion,
    shouldTriggerFileCompletion() {
      return true;
    },
  };
  const runtime = {
    async searchFileCandidates() {
      throw new Error("FFF init failed");
    },
    async trackQuery() {},
  };

  const provider = createFffAutocompleteProvider(baseProvider as never, runtime as never);
  const suggestions = await provider.getSuggestions(["inspect @src"], 0, 12, { signal: new AbortController().signal, force: false });

  assert.deepEqual(suggestions, { prefix: "@src", items: [{ value: "@fallback.ts", label: "fallback" }] });
});
