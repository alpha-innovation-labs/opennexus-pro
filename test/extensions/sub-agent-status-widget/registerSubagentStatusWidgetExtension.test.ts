import assert from "node:assert/strict";
import test from "node:test";
import { registerSubagentStatusWidgetExtension } from "../../../packages/extensions/src/sub-agent-status-widget/registerSubagentStatusWidgetExtension.js";
import { subagentStatusWidgetIndicator } from "../../../packages/extensions/src/sub-agent-status-widget/runtime/subagentStatusWidgetIndicator.js";
import { SUBAGENT_STATUS_WIDGET_KEY } from "../../../packages/extensions/src/sub-agent-status-widget/runtime/subagentStatusWidgetKey.js";
import { sharedSubagentRuntime } from "../../../packages/extensions/src/sub-agents/runtime/sharedSubagentRuntime.js";

type SessionStartHandler = ((event: unknown, ctx: any) => Promise<void>) | undefined;
type SessionShutdownHandler = ((event: unknown, ctx: any) => Promise<void>) | undefined;

/**
 * Resets the shared runtime between extension assertions.
 */
function resetRuntime(): void {
  sharedSubagentRuntime.clear();
}

/**
 * Creates one minimal registration harness for the subagent status widget extension.
 *
 * @returns Registered handlers and collected UI calls.
 */
function createHarness(): {
  sessionStartHandler: SessionStartHandler;
  sessionShutdownHandler: SessionShutdownHandler;
  ctx: any;
  indicatorCalls: Array<unknown>;
  widgetCalls: Array<{ key: string; value: unknown; placement?: string }>;
} {
  let sessionStartHandler: SessionStartHandler;
  let sessionShutdownHandler: SessionShutdownHandler;
  const indicatorCalls: Array<unknown> = [];
  const widgetCalls: Array<{ key: string; value: unknown; placement?: string }> = [];

  registerSubagentStatusWidgetExtension({
    on(eventName: string, handler: unknown) {
      if (eventName === "session_start") sessionStartHandler = handler as SessionStartHandler;
      if (eventName === "session_shutdown") sessionShutdownHandler = handler as SessionShutdownHandler;
    },
  } as never);

  const ctx = {
    hasUI: true,
    isIdle() {
      return true;
    },
    ui: {
      setWorkingIndicator(indicator?: unknown) {
        indicatorCalls.push(indicator);
      },
      setWidget(key: string, value: unknown, options?: { placement?: string }) {
        widgetCalls.push({ key, value, placement: options?.placement });
      },
      theme: {
        fg(_color: string, text: string) {
          return text;
        },
        bold(text: string) {
          return text;
        },
      },
    },
  };

  return { sessionStartHandler, sessionShutdownHandler, ctx, indicatorCalls, widgetCalls };
}

test.beforeEach(() => {
  resetRuntime();
});

test.after(() => {
  resetRuntime();
});

test("subagent status widget uses Pi working-indicator animation without installing a polling interval", async () => {
  const originalSetInterval = globalThis.setInterval;
  let intervalCalls = 0;
  globalThis.setInterval = ((...args: Parameters<typeof setInterval>) => {
    intervalCalls += 1;
    return originalSetInterval(...args);
  }) as typeof setInterval;

  try {
    const { sessionStartHandler, ctx, indicatorCalls } = createHarness();
    await sessionStartHandler?.({}, ctx);

    assert.equal(intervalCalls, 0);
    assert.deepEqual(indicatorCalls, [subagentStatusWidgetIndicator]);
  } finally {
    globalThis.setInterval = originalSetInterval;
  }
});

test("subagent status widget clears its widget and restores Pi's default working indicator on shutdown", async () => {
  const { sessionStartHandler, sessionShutdownHandler, ctx, indicatorCalls, widgetCalls } = createHarness();

  await sessionStartHandler?.({}, ctx);
  await sessionShutdownHandler?.({}, ctx);

  assert.deepEqual(indicatorCalls, [subagentStatusWidgetIndicator, undefined]);
  assert.deepEqual(widgetCalls.at(-1), {
    key: SUBAGENT_STATUS_WIDGET_KEY,
    value: undefined,
    placement: "aboveEditor",
  });
});
