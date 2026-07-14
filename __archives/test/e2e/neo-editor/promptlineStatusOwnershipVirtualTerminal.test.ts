import assert from "node:assert/strict";
import test from "node:test";
import type { Component } from "@earendil-works/pi-tui";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { renderPromptlineStatusWidget } from "../../../packages/extension-core/src/neo-editor/features/promptline/status-widget/renderPromptlineStatusWidget.js";
import { registerObservationsExtension } from "../../../packages/extensions-pro/src/observations/registerObservationsExtension.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

type RegisteredHandler = (event: unknown, ctx: ExtensionContext) => Promise<void> | void;

/**
 * Removes terminal escape sequences from a rendered line.
 *
 * @param line Rendered terminal line.
 * @returns Plain visible terminal text.
 */
function stripAnsi(line: string): string {
  return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

/**
 * Creates the minimal promptline context needed to render status ownership.
 *
 * @param setWidget Captures widget registration calls.
 * @returns Extension context stub.
 */
function createPromptlineContext(setWidget: ExtensionContext["ui"]["setWidget"]): ExtensionContext {
  return {
    hasUI: true,
    cwd: process.cwd(),
    model: { id: "gpt-5.5", provider: "openai-codex", reasoning: true },
    ui: { theme: createTestTheme(), setWidget },
    sessionManager: {
      getBranch: () => [
        {
          type: "message",
          message: { role: "user", content: "Add yfinance exchange crate" },
        },
      ],
    },
  } as unknown as ExtensionContext;
}

/**
 * Creates a fake extension API that records registered event handlers.
 *
 * @returns Extension API stub and captured handlers.
 */
function createExtensionApi(): { api: ExtensionAPI; handlers: Map<string, RegisteredHandler[]> } {
  const handlers = new Map<string, RegisteredHandler[]>();
  const api = {
    on(event: string, handler: RegisteredHandler): void {
      handlers.set(event, [...(handlers.get(event) ?? []), handler]);
    },
    registerCommand(): void {},
    registerShortcut(): void {},
  } as unknown as ExtensionAPI;

  return { api, handlers };
}

/**
 * Counts handlers registered for one extension event.
 *
 * @param handlers Captured handlers by event name.
 * @param event Event name to count.
 * @returns Registered handler count.
 */
function countEventHandlers(handlers: Map<string, RegisteredHandler[]>, event: string): number {
  return handlers.get(event)?.length ?? 0;
}

test("Neo exclusively owns the promptline metadata status widget", async () => {
  let promptlineWidgetFactory: (() => Component) | undefined;
  const setWidget = ((key: string, content: unknown) => {
    if (key === "observations-status-widget" && typeof content === "function") {
      promptlineWidgetFactory = content as () => Component;
    }
  }) as ExtensionContext["ui"]["setWidget"];
  const ctx = createPromptlineContext(setWidget);

  renderPromptlineStatusWidget(ctx, () => "high", () => undefined);
  assert.ok(promptlineWidgetFactory, "Neo promptline widget should register the metadata status widget");

  const viewport = await renderComponentInVirtualTerminal(() => promptlineWidgetFactory!(), 96, 8);
  const output = viewport.map(stripAnsi).join("\n");

  assert.match(output, /gpt-5\.5/u);
  assert.match(output, /high/u);
  assert.match(output, /Add yfinance exchange crate/u);
  assert.match(output, /\[ ⏱ \d+s\]/u);
  assert.doesNotMatch(output, /\(\d+s\)/u);

  const { api, handlers } = createExtensionApi();
  registerObservationsExtension(api);

  assert.equal(countEventHandlers(handlers, "session_start"), 1);
  assert.equal(countEventHandlers(handlers, "message_start"), 0);
  assert.equal(countEventHandlers(handlers, "model_select"), 0);
});
