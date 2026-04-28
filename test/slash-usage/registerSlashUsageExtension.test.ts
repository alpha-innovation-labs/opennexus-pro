import assert from "node:assert/strict";
import test from "node:test";
import { registerSlashUsageExtension } from "../../packages/extensions/src/usage-meter/registerSlashUsageExtension.js";

test("registerSlashUsageExtension does not install a duplicate below-editor widget", () => {
  const handlers: Record<string, Function> = {};
  let widgetCalls = 0;

  registerSlashUsageExtension({
    registerCommand() {},
    on(event: string, handler: Function) {
      handlers[event] = handler;
    },
  } as never);

  handlers.session_start?.({ reason: "startup" }, {
    cwd: process.cwd(),
    hasUI: true,
    model: { provider: "unknown", id: "unknown" },
    ui: {
      setWidget() {
        widgetCalls += 1;
      },
    },
  });

  assert.equal(widgetCalls, 0);
});
