import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { TUI, type Component } from "@earendil-works/pi-tui";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { showStartupResumeModal } from "../../../packages/extension-core/src/slash-menu/internal-commands/showStartupResumeModal.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { VirtualTerminal } from "../../support/terminal/VirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/** Creates a persisted session with deterministic display text for the resume picker. */
function createSession(sessionDir: string, title: string, timestamp: number): string {
  const manager = SessionManager.create(process.cwd(), sessionDir);
  manager.appendSessionInfo(title);
  manager.appendMessage({
    role: "user",
    content: [{ type: "text", text: `${title} prompt` }],
    timestamp,
  } as never);
  manager.appendMessage({
    role: "assistant",
    content: [{ type: "text", text: `${title} assistant` }],
    timestamp: timestamp + 1,
    stopReason: "end_turn",
    usage: {
      input: 1,
      output: 1,
      cacheRead: 0,
      cacheWrite: 0,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    },
    provider: "openai",
    model: "gpt-5.4",
  } as never);
  return manager.getSessionFile()!;
}

/** Waits for async modal initialization and terminal rendering to settle. */
async function waitForModalRender(terminal: VirtualTerminal): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 50));
  await terminal.waitForRender();
}

/** Rejects when the startup resume modal does not finish after keyboard input. */
async function failWhenModalStalls(): Promise<never> {
  await new Promise<void>((resolve) => setTimeout(resolve, 250));
  throw new Error("startup resume modal did not receive keyboard input");
}

test("startup resume modal routes navigation keys even when editor focus is restored", async () => {
  const sessionDir = await mkdtemp(join(tmpdir(), "nexus-startup-resume-modal-"));
  const homeDir = await mkdtemp(join(tmpdir(), "nexus-startup-resume-home-"));
  const originalHome = process.env.HOME;
  const terminal = new VirtualTerminal(120, 40);
  const tui = new TUI(terminal, false);
  const editor = new LinesComponent(() => ["editor focus owner"]);
  let editorText = "";

  try {
    process.env.HOME = homeDir;
    const olderSessionPath = createSession(sessionDir, "Older startup resume", Date.now() - 2_000);
    createSession(sessionDir, "Newer startup resume", Date.now());
    tui.addChild(editor);
    tui.setFocus(editor);
    tui.start();

    const modalPromise = showStartupResumeModal({
      hasUI: true,
      cwd: process.cwd(),
      model: { provider: "openai", id: "gpt-5.4" },
      modelRegistry: { getAvailable: () => [], authStorage: { get: () => undefined, hasAuth: () => false, list: () => [] } },
      sessionManager: { getSessionDir: () => sessionDir, getEntries: () => [], getTree: () => [] },
      ui: {
        theme: createTestTheme(),
        notify: () => undefined,
        setEditorText: (text: string) => { editorText = text; },
        onTerminalInput: (handler: (data: string) => { consume?: boolean; data?: string } | undefined) => tui.addInputListener(handler),
        custom: async <T>(factory: (activeTui: TUI, theme: unknown, keybindings: unknown, done: (result: T) => void) => Component, options?: { overlayOptions?: unknown }): Promise<T> => new Promise<T>((resolve) => {
          const done = (result: T): void => {
            tui.hideOverlay();
            resolve(result);
          };
          const component = factory(tui, createTestTheme(), undefined, done);
          tui.showOverlay(component, options?.overlayOptions as never);
          tui.setFocus(editor);
          tui.requestRender(true);
        }),
      },
    } as never);

    await waitForModalRender(terminal);
    (tui as never as { handleInput(data: string): void }).handleInput("\x1b[B");
    (tui as never as { handleInput(data: string): void }).handleInput("\r");
    await Promise.race([modalPromise, failWhenModalStalls()]);

    assert.equal(Buffer.from(editorText.split(" ")[1] ?? "", "base64").toString("utf8"), olderSessionPath);
  } finally {
    tui.stop();
    if (originalHome === undefined) delete process.env.HOME;
    else process.env.HOME = originalHome;
    await rm(sessionDir, { recursive: true, force: true });
    await rm(homeDir, { recursive: true, force: true });
  }
});
