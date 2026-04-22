import { registerFffExtension } from "../../../src/extensions/fff/registerFffExtension.js";
import type { RegisteredTool, TestContext } from "./types.js";

/**
 * Creates a minimal extension harness for FFF lifecycle tests.
 *
 * @returns Registered handlers and tools.
 */
export function createRegisterFffExtensionHarness(): {
  handlers: Map<string, (event: unknown, ctx: TestContext) => Promise<void> | void>;
  tools: Map<string, RegisteredTool>;
} {
  const handlers = new Map<string, (event: unknown, ctx: TestContext) => Promise<void> | void>();
  const tools = new Map<string, RegisteredTool>();

  registerFffExtension({
    on(event: string, handler: (event: unknown, ctx: TestContext) => Promise<void> | void) {
      handlers.set(event, handler);
    },
    registerTool(tool: RegisteredTool) {
      tools.set(tool.name, tool);
    },
  } as never);

  return { handlers, tools };
}
