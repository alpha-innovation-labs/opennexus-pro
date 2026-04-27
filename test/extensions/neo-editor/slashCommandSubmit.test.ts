import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { primeStartupResumeModal } from "../../../src/extensions/neo-editor/primeStartupResumeModal.js";
import { createSlashModal } from "../../../src/extensions/neo-editor/features/promptline/trigger/createSlashModal.js";
import { startupResumeEnvVar } from "../../../src/runtime/cli/normalizeResumeStartupArgs.js";
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
    },
    ui: {
      theme: createTestTheme(),
      notify: () => undefined,
    },
  };
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

test("slash modal enters the resume submenu without submitting the raw /resume command", async () => {
  const originalList = SessionManager.list;
  let submitted = "";
  let renders = 0;
  (SessionManager as any).list = async () => [];

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
    assert.match(viewport.join("\n"), /Resume/);
    assert.ok(renders > 0);
  } finally {
    (SessionManager as any).list = originalList;
  }
});

test("resume submenu hides cwd metadata and shows the shared Tron-style transcript preview", async () => {
  const originalList = SessionManager.list;
  const { sessionDir, sessionPath } = await createResumeSessionFixture();

  try {
    await initializePiThemes();
    (SessionManager as any).list = async () => [{
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
