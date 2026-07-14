import assert from "node:assert/strict";
import test from "node:test";
import { createTelemetryExtensionApi } from "../../packages/feature-flags/src/createTelemetryExtensionApi.js";
import { registerTelemetryRuntimeExtension } from "../../packages/extensions-dev/src/telemetry-runtime/registerTelemetryRuntimeExtension.js";
import { setTelemetryEventEnabled } from "../../packages/observability/src/telemetry/setTelemetryEventEnabled.js";

const calls: Array<{ input: string; init: RequestInit }> = [];
const originalFetch = globalThis.fetch;

/**
 * Installs a fetch spy for telemetry tests.
 */
function installFetchSpy(): void {
  calls.length = 0;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ input: String(input), init: init ?? {} });
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
}

/**
 * Restores the process fetch implementation.
 */
function restoreFetch(): void {
  globalThis.fetch = originalFetch;
}

/**
 * Reads emitted telemetry event names from the fetch spy.
 *
 * @returns Event names sent during the test.
 */
function getSentEventNames(): string[] {
  return calls.flatMap((call) => {
    const payload = JSON.parse(String(call.init.body));
    const span = payload.resourceSpans?.[0]?.scopeSpans?.[0]?.spans?.[0];
    return span?.name ? [span.name] : [];
  });
}

/**
 * Waits for fire-and-forget telemetry timers to flush in tests.
 */
async function waitForTelemetryFlush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

test("command wrappers emit command and extension telemetry", async () => {
  installFetchSpy();
  const commands = new Map<string, Record<string, unknown>>();
  const pi = { registerCommand: (name: string, definition: Record<string, unknown>) => commands.set(name, definition) };
  const wrapped = createTelemetryExtensionApi(pi as never, "dev");
  wrapped.registerCommand("sample" as never, { handler: async () => "ok" } as never);

  await (commands.get("sample")?.handler as () => Promise<string>)();
  await waitForTelemetryFlush();
  restoreFetch();

  assert.deepEqual(getSentEventNames(), ["command.used", "extension.used"]);
});

test("runtime telemetry listeners emit command, session, model, and tool events", async () => {
  installFetchSpy();
  const handlers = new Map<string, (event: unknown) => Promise<void>>();
  const pi = { on: (eventName: string, handler: (event: unknown) => Promise<void>) => handlers.set(eventName, handler) };
  registerTelemetryRuntimeExtension(pi as never);

  await handlers.get("input")?.({ text: "/model ignored arguments" });
  await handlers.get("session_start")?.({ reason: "resume" });
  await handlers.get("model_select")?.({ model: { provider: "anthropic", id: "claude-sonnet-4" }, source: "set" });
  await handlers.get("tool_result")?.({ toolName: "bash", isError: true });
  await waitForTelemetryFlush();
  restoreFetch();

  assert.deepEqual(getSentEventNames(), [
    "command.used",
    "session.started",
    "provider.category.selected",
    "model.category.switched",
    "tool.error",
  ]);
});

test("disabled telemetry entries suppress wrapped command events", async () => {
  installFetchSpy();
  setTelemetryEventEnabled("command.used", false);
  const commands = new Map<string, Record<string, unknown>>();
  const wrapped = createTelemetryExtensionApi({ registerCommand: (name: string, definition: Record<string, unknown>) => commands.set(name, definition) } as never, "dev");
  wrapped.registerCommand("sample" as never, { handler: async () => "ok" } as never);

  await (commands.get("sample")?.handler as () => Promise<string>)();
  await waitForTelemetryFlush();
  setTelemetryEventEnabled("command.used", true);
  restoreFetch();

  assert.deepEqual(getSentEventNames(), ["extension.used"]);
});
