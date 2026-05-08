import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { Component } from "@mariozechner/pi-tui";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { primeStartupResumeModal } from "../../../packages/extensions/src/neo-editor/primeStartupResumeModal.js";
import { HotkeysModal } from "../../../packages/extensions/src/hotkeys/HotkeysModal.js";
import { createSlashModal } from "../../../packages/extensions/src/neo-editor/features/promptline/trigger/createSlashModal.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../packages/extensions/src/slash-menu/registerSlashCommand.js";
import { startupResumeEnvVar } from "../../../packages/nexus-runtime/src/cli/normalizeResumeStartupArgs.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";

/**
 * Creates the minimum extension context required by the slash modal.
 *
 * @returns Fake extension context.
 */
function createContext() {
  return {
    cwd: process.cwd(),
    sessionManager: {
      getSessionDir() {
        return process.cwd();
      },
      getSessionName() {
        return "Current name";
      },
    },
    ui: {
      theme: createTestTheme(),
      notify: () => undefined,
      editor: async () => undefined,
      custom: async () => undefined,
    },
  };
}

/** Waits one macrotask for async modal handlers. */
async function flushAsyncWork(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

/**
 * Creates one persisted session file for resume-preview tests.
 *
 * @returns Session directory and session path.
 */
async function createResumeSessionFixture(): Promise<{ sessionDir: string; sessionPath: string }> {
  const sessionDir = await mkdtemp(join(tmpdir(), "nexus-resume-session-"));
  const manager = SessionManager.create(process.cwd(), sessionDir);
  manager.appendSessionInfo("Resume transcript fixture");
  manager.appendMessage({ role: "user", content: [{ type: "text", text: "Explain the recent fix." }], timestamp: Date.now() - 2_000 } as never);
  manager.appendMessage({
    role: "assistant",
    content: [
      { type: "thinking", thinking: "Reviewing the latest transcript changes." },
      { type: "toolCall", id: "tool-1", name: "read", arguments: { path: "src/file.ts" } },
      { type: "text", text: "I found the issue and fixed it." },
    ],
    timestamp: Date.now() - 1_000,
    stopReason: "end_turn",
    usage: { input: 10, output: 20, cacheCreationInputTokens: 0, cacheReadInputTokens: 0 },
    provider: "openai",
    model: "gpt-5.4",
  } as never);
  manager.appendMessage({
    role: "toolResult",
    toolCallId: "tool-1",
    toolName: "read",
    content: [{ type: "text", text: "read result" }],
    isError: false,
    timestamp: Date.now() - 900,
  } as never);
  return { sessionDir, sessionPath: manager.getSessionFile()! };
}

test("slash modal prefills a custom command without submitting it", async () => {
  let text = "";
  let submitted = "";
  let closed = false;
  const { modal } = createSlashModal(
    createContext() as never,
    () => { closed = true; },
    () => undefined,
    (value) => { text = value; },
    () => "medium",
    () => undefined,
    (value) => { submitted = value; },
    (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
    () => [{ name: "git-commit", description: "Commit changes", source: "prompt" }] as never,
  );

  modal.setQuery("git");
  await modal.refresh();
  modal.handleInput("\r");
  await flushAsyncWork();

  assert.equal(text, "/git-commit ");
  assert.equal(submitted, "");
  assert.equal(closed, true);
});

test("slash modal submits a picked extension command immediately", async () => {
  let text = "";
  let submitted = "";
  clearRegisteredSlashCommands();
  registerSlashCommand({ name: "git-commit", description: "Commit changes", source: "extension" });
  const { modal } = createSlashModal(
    createContext() as never,
    () => undefined,
    () => undefined,
    (value) => { text = value; },
    () => "medium",
    () => undefined,
    (value) => { submitted = value; },
    (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
  );

  modal.setQuery("git");
  await modal.refresh();
  modal.handleInput("\r");
  await flushAsyncWork();

  assert.equal(text, "");
  assert.equal(submitted, "/git-commit");
  clearRegisteredSlashCommands();
});

test("slash modal submits the built-in tree command for Pi to handle", async () => {
  let text = "";
  let submitted = "";
  const { modal } = createSlashModal(
    createContext() as never,
    () => undefined,
    () => undefined,
    (value) => { text = value; },
    () => "medium",
    () => undefined,
    (value) => { submitted = value; },
    (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
  );

  modal.setQuery("tree");
  await modal.refresh();
  modal.handleInput("\r");
  await flushAsyncWork();

  assert.equal(text, "");
  assert.equal(submitted, "/tree");
});

test("slash modal opens the custom settings submenu on settings pick", async () => {
  let text = "unchanged";
  let submitted = "";
  const { modal } = createSlashModal(
    createContext() as never,
    () => undefined,
    () => undefined,
    (value) => {
      text = value;
    },
    () => "medium",
    () => undefined,
    (value) => {
      submitted = value;
    },
    (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
  );

  modal.setQuery("settings");
  await modal.refresh();
  modal.handleInput("\r");

  assert.equal(text, "unchanged");
  assert.equal(submitted, "");
});

test("slash modal opens Nexus hotkeys modal instead of submitting built-in hotkeys", async () => {
  let submitted = "";
  let closed = false;
  let customComponent: Component | undefined;
  const ctx = {
    ...createContext(),
    ui: {
      ...createContext().ui,
      custom: async (factory: any) => {
        customComponent = await factory({ requestRender: () => undefined }, createTestTheme(), {
          getResolvedBindings: () => ({ "tui.input.submit": "enter" }),
          getDefinition: () => ({ description: "Submit input" }),
        }, () => undefined);
      },
    },
  };
  const { modal } = createSlashModal(
    ctx as never,
    () => { closed = true; },
    () => undefined,
    () => undefined,
    () => "medium",
    () => undefined,
    (value) => { submitted = value; },
    (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
  );

  modal.setQuery("hotkeys");
  await modal.refresh();
  modal.handleInput("\r");
  await flushAsyncWork();

  assert.equal(submitted, "");
  assert.equal(closed, true);
  assert.ok(customComponent instanceof HotkeysModal);
});

test("slash modal opens a session name input submenu with the current name prefilled", async () => {
  let submitted = "";
  const { modal } = createSlashModal(
    createContext() as never,
    () => undefined,
    () => undefined,
    () => undefined,
    () => "medium",
    () => undefined,
    (value) => { submitted = value; },
    (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
  );

  modal.setQuery("name");
  await modal.refresh();
  modal.handleInput("\r");
  await flushAsyncWork();
  const viewport = await renderComponentInVirtualTerminal(() => modal, 100, 30);

  assert.match(viewport.join("\n"), /Name > Current name/);
  modal.handleInput("\u007f");
  modal.handleInput("!");
  modal.handleInput("\r");

  assert.equal(submitted, "/name Current nam!");
});

test("slash modal enters the resume submenu without submitting the raw /resume command", async () => {
  const originalList = SessionManager.list;
  const originalListAll = SessionManager.listAll;
  let submitted = "";
  let renders = 0;
  (SessionManager as any).list = async () => [];
  (SessionManager as any).listAll = async () => [];

  try {
    const { modal } = createSlashModal(
      createContext() as never,
      () => undefined,
      () => {
        renders += 1;
      },
      () => undefined,
      () => "medium",
      () => undefined,
      (value) => {
        submitted = value;
      },
      (() => ({ hide: () => undefined, focus: () => void (renders += 1), isFocused: () => true })) as never,
    );

    modal.setQuery("resume");
    await modal.refresh();
    renders = 0;
    modal.handleInput("\r");
    await Promise.resolve();
    const viewport = await renderComponentInVirtualTerminal(() => modal, 120, 30);

    assert.equal(submitted, "");
    assert.match(viewport.join("\n"), /◉ Current Folder │ ○ All/u);
    assert.ok(renders > 0);
  } finally {
    (SessionManager as any).list = originalList;
    (SessionManager as any).listAll = originalListAll;
  }
});

test("resume submenu search filters cached leaves without relisting sessions", async () => {
  const originalList = SessionManager.list;
  const originalListAll = SessionManager.listAll;
  const { sessionDir, sessionPath } = await createResumeSessionFixture();
  let listCalls = 0;
  let listAllCalls = 0;

  try {
    (SessionManager as any).list = async () => {
      listCalls += 1;
      return [{ path: sessionPath, name: "Cached resume search fixture", modified: new Date() }];
    };
    (SessionManager as any).listAll = async () => {
      listAllCalls += 1;
      return [];
    };

    const { modal } = createSlashModal(
      {
        ...createContext(),
        sessionManager: {
          getSessionDir() {
            return sessionDir;
          },
        },
      } as never,
      () => undefined,
      () => undefined,
      () => undefined,
      () => "medium",
      () => undefined,
      () => undefined,
      (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
    );

    modal.setQuery("resume");
    await modal.refresh();
    modal.handleInput("\r");
    await flushAsyncWork();
    modal.handleInput("c");
    await flushAsyncWork();
    modal.handleInput("a");
    await flushAsyncWork();

    assert.equal(listCalls, 1);
    assert.equal(listAllCalls, 0);
  } finally {
    (SessionManager as any).list = originalList;
    (SessionManager as any).listAll = originalListAll;
    await rm(sessionDir, { recursive: true, force: true });
  }
});

test("resume submenu hides cwd metadata and shows the shared Tron-style transcript preview", async () => {
  const originalList = SessionManager.list;
  const originalListAll = SessionManager.listAll;
  const { sessionDir, sessionPath } = await createResumeSessionFixture();

  try {
    await initializePiThemes();
    (SessionManager as any).list = async () => [{
      path: sessionPath,
      name: "Resume transcript fixture",
      cwd: "/tmp/should-not-render",
      modified: new Date(),
    }];
    (SessionManager as any).listAll = async () => [{
      path: sessionPath,
      name: "Resume transcript fixture",
      cwd: "/tmp/should-not-render",
      modified: new Date(),
    }];

    const { modal } = createSlashModal(
      {
        ...createContext(),
        sessionManager: {
          getSessionDir() {
            return sessionDir;
          },
        },
      } as never,
      () => undefined,
      () => undefined,
      () => undefined,
      () => "medium",
      () => undefined,
      () => undefined,
      (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
    );

    modal.setQuery("resume");
    await modal.refresh();
    modal.handleInput("\r");
    await Promise.resolve();
    await renderComponentInVirtualTerminal(() => modal, 120, 30);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const viewport = await renderComponentInVirtualTerminal(() => modal, 120, 30);
    const output = viewport.join("\n");

    assert.doesNotMatch(output, /should-not-render/);
    assert.match(output, /Explain the recent fix\./);
    assert.match(output, /Reviewing the latest transcript/);
    assert.match(output, /I found the issue and fixed it\./);
    assert.match(output, /read/);
  } finally {
    (SessionManager as any).list = originalList;
    (SessionManager as any).listAll = originalListAll;
    await rm(sessionDir, { recursive: true, force: true });
  }
});

test("resume submenu shows scope tabs and places metadata below the conversation title", async () => {
  const originalList = SessionManager.list;
  const originalListAll = SessionManager.listAll;
  const { sessionDir, sessionPath } = await createResumeSessionFixture();

  try {
    (SessionManager as any).list = async () => [{
      path: sessionPath,
      name: "Current folder conversation title that should not change row height",
      modified: new Date(),
    }];
    (SessionManager as any).listAll = async () => [{
      path: sessionPath,
      name: "Global conversation title",
      modified: new Date(),
    }];

    const { modal } = createSlashModal(
      {
        ...createContext(),
        sessionManager: {
          getSessionDir() {
            return sessionDir;
          },
        },
      } as never,
      () => undefined,
      () => undefined,
      () => undefined,
      () => "medium",
      () => undefined,
      () => undefined,
      (() => ({ hide: () => undefined, focus: () => undefined, isFocused: () => true })) as never,
    );

    modal.setQuery("resume");
    await modal.refresh();
    modal.handleInput("\r");
    const currentView = (await renderComponentInVirtualTerminal(() => modal, 130, 24)).join("\n");
    const currentLines = currentView.split("\n");
    const titleLineIndex = currentLines.findIndex((line) => line.includes("Current folder conversation title"));
    const metadataLineIndex = currentLines.findIndex((line, index) => index > titleLineIndex && line.includes("󰀄"));

    assert.match(currentView, /◉ Current Folder │ ○ All/u);
    assert.ok(titleLineIndex >= 0);
    assert.equal(metadataLineIndex, titleLineIndex + 1);
    assert.doesNotMatch(currentLines[titleLineIndex]!, /󰀄/u);

    modal.handleInput("\t");
    const allView = (await renderComponentInVirtualTerminal(() => modal, 130, 24)).join("\n");
    assert.match(allView, /○ Current Folder │ ◉ All/u);
    assert.match(allView, /Global conversation title/u);
  } finally {
    (SessionManager as any).list = originalList;
    (SessionManager as any).listAll = originalListAll;
    await rm(sessionDir, { recursive: true, force: true });
  }
});

test("startup resume priming opens the Nexus-owned resume modal path", async () => {
  const originalEnv = process.env[startupResumeEnvVar];
  process.env[startupResumeEnvVar] = "1";
  const cwd = await mkdtemp(join(tmpdir(), "nexus-startup-resume-"));
  let opened = false;

  try {
    await primeStartupResumeModal("startup", {
      hasUI: true,
      cwd,
      ui: {
        async custom() {
          opened = true;
        },
      },
    } as never);
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(opened, true);
  } finally {
    if (originalEnv === undefined) delete process.env[startupResumeEnvVar];
    else process.env[startupResumeEnvVar] = originalEnv;
    await rm(cwd, { recursive: true, force: true });
  }
});
