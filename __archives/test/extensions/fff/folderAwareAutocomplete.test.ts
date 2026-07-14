import assert from "node:assert/strict";
import test from "node:test";
import { createFffAutocompleteProvider } from "../../../packages/extension-core/src/fff/editor/createFffAutocompleteProvider.js";

/**
 * Creates a minimal base autocomplete provider for tests.
 *
 * @returns Base provider.
 */
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
  };
}

test("createFffAutocompleteProvider surfaces folder suggestions for @ queries", async () => {
  const runtime = {
    async searchFileCandidates() {
      return [
        {
          item: { path: "", relativePath: "packages/extension-core/src/fff/index.ts", fileName: "index.ts", totalFrecencyScore: 0, gitStatus: "clean" },
          score: { matchType: "prefix" },
        },
        {
          item: { path: "", relativePath: "packages/extension-core/src/tron/index.ts", fileName: "index.ts", totalFrecencyScore: 0, gitStatus: "clean" },
          score: { matchType: "prefix" },
        },
      ];
    },
    async trackQuery() {},
  };

  const provider = createFffAutocompleteProvider(createBaseProvider() as never, runtime as never);
  const suggestions = await provider.getSuggestions(["open @exten"], 0, 11, { signal: new AbortController().signal, force: false });

  assert.equal(suggestions?.items[0]?.value, "@src/extensions");
  assert.equal(suggestions?.items[0]?.description, "packages/extension-core/src/ · folder");
});
