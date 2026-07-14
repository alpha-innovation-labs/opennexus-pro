import test from "node:test";
import assert from "node:assert/strict";
import { composeSubagentContext } from "../../../../packages/extension-core/src/sub-agents/context-providers/composeSubagentContext.js";
import { createParentConversationProvider } from "../../../../packages/extension-core/src/sub-agents/context-providers/createParentConversationProvider.js";
import { createSubagentContextRegistry } from "../../../../packages/extension-core/src/sub-agents/context-providers/createSubagentContextRegistry.js";

/**
 * Creates a tiny extension-context stub for context provider tests.
 *
 * @returns Stubbed context.
 */
function createStubContext() {
  return {
    cwd: process.cwd(),
    sessionManager: {
      getBranch() {
        return [
          { type: "message", message: { role: "user", content: [{ type: "text", text: "hello" }] } },
          { type: "message", message: { role: "assistant", content: [{ type: "text", text: "hi there" }] } },
          { type: "compaction", summary: "Short summary" },
        ];
      },
      getSessionFile() {
        return null;
      },
    },
  } as any;
}

/**
 * Verifies ordered provider composition.
 */
test("composeSubagentContext joins non-empty provider blocks in order", async () => {
  const ctx = createStubContext();
  const registry = createSubagentContextRegistry([
    { id: "one", async provide() { return "first"; } },
    { id: "two", async provide() { return ""; } },
    { id: "three", async provide() { return "third"; } },
  ]);

  const result = await composeSubagentContext(ctx, registry.list());
  assert.equal(result, "first\n\n---\n\nthird");
});

/**
 * Verifies parent conversation serialization.
 */
test("createParentConversationProvider serializes the current parent branch", async () => {
  const provider = createParentConversationProvider();
  const result = await provider.provide({ ctx: createStubContext() });

  assert.match(result, /# Parent Conversation Context/);
  assert.match(result, /\[User\]: hello/);
  assert.match(result, /\[Assistant\]: hi there/);
  assert.match(result, /\[Summary\]: Short summary/);
});
