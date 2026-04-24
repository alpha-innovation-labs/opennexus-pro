import assert from "node:assert/strict";
import test from "node:test";
import { registerContextUsageExtension } from "../../../src/extensions/context-usage/registerContextUsageExtension.js";

test("context usage extension registers a tool that reports current context usage", async () => {
  let registeredTool:
    | {
        name: string;
        execute: (...args: unknown[]) => Promise<{ content: Array<{ type: string; text: string }> }>;
      }
    | undefined;

  registerContextUsageExtension({
    registerTool(tool: {
      name: string;
      execute: (...args: unknown[]) => Promise<{ content: Array<{ type: string; text: string }> }>;
    }) {
      registeredTool = tool;
    },
  } as never);

  assert.ok(registeredTool);
  assert.equal(registeredTool.name, "context_usage");

  const result = await registeredTool.execute("tool-1", {}, undefined, undefined, {
    getContextUsage() {
      return { tokens: 60000, contextWindow: 200000, percent: 30 };
    },
  });

  assert.deepEqual(result, {
    content: [
      {
        type: "text",
        text: "Context tokens used: 60,000\nContext window: 200,000\nContext usage: 30.0%",
      },
    ],
    details: undefined,
  });
});
