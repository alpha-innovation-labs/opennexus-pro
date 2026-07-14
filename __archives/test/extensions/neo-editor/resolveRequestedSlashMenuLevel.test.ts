import assert from "node:assert/strict";
import test from "node:test";
import { resolveRequestedSlashMenuLevel } from "../../../packages/extension-core/src/slash-menu/resolveRequestedSlashMenuLevel.js";

/**
 * Creates a slash-menu context with configurable available models.
 */
function createContext(availableModels: unknown[]) {
  return {
    modelRegistry: {
      getAvailable: () => availableModels,
    },
  };
}

test("resolveRequestedSlashMenuLevel redirects model to login when no models are available", () => {
  assert.equal(resolveRequestedSlashMenuLevel(createContext([]) as never, "model"), "login");
});

test("resolveRequestedSlashMenuLevel keeps model level when authenticated models exist", () => {
  assert.equal(resolveRequestedSlashMenuLevel(createContext([{ provider: "openai", id: "gpt-5" }]) as never, "model"), "model");
});
