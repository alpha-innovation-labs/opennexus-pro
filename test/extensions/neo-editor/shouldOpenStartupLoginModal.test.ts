import assert from "node:assert/strict";
import test from "node:test";
import { shouldOpenStartupLoginModal } from "../../../packages/extensions/src/slash-menu/shouldOpenStartupLoginModal.js";

/**
 * Creates a startup login predicate context.
 */
function createContext(hasUI: boolean, availableModels: unknown[]) {
  return {
    hasUI,
    modelRegistry: {
      getAvailable: () => availableModels,
    },
  };
}

test("shouldOpenStartupLoginModal opens login on UI startup with no available models", () => {
  assert.equal(shouldOpenStartupLoginModal("startup", createContext(true, []) as never), true);
});

test("shouldOpenStartupLoginModal skips startup login when a provider model is available", () => {
  assert.equal(shouldOpenStartupLoginModal("startup", createContext(true, [{ provider: "openai", id: "gpt-5" }]) as never), false);
});

test("shouldOpenStartupLoginModal skips non-startup and non-UI sessions", () => {
  assert.equal(shouldOpenStartupLoginModal("resume", createContext(true, []) as never), false);
  assert.equal(shouldOpenStartupLoginModal("startup", createContext(false, []) as never), false);
});
