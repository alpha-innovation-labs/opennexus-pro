import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { PromptlineEditor } from "../../../src/extensions/neo-editor/promptline/PromptlineEditor.js";
import { clearPromptlineConfig } from "../../../src/extensions/neo-editor/promptline/config/clearPromptlineConfig.js";
import { getPromptlineConfig } from "../../../src/extensions/neo-editor/promptline/config/getPromptlineConfig.js";
import { refreshPromptlineConfig } from "../../../src/extensions/neo-editor/promptline/config/refreshPromptlineConfig.js";
import { clearTriggerSession } from "../../../src/extensions/neo-editor/promptline/trigger/sessionState.js";
import { showStartupResumeModal } from "../../../src/extensions/shared/slash-menu/internal-commands/showStartupResumeModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";
/**
 * Waits for queued async work to settle.
 */
async function flushAsyncWork(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates one temporary cwd and agent config sandbox.
 *
 * @returns Temporary cwd and agent dir.
 */
async function createConfigSandbox(): Promise<{ cwd: string; agentDir: string }> {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-startup-resume-cwd-"));
  const agentDir = await mkdtemp(join(tmpdir(), "nexus-startup-resume-agent-"));
  await mkdir(join(cwd, ".nexus", "extensions", "neo-editor"), { recursive: true });
  return { cwd, agentDir };
}

/**
 * Creates one persisted session fixture for the resume modal.
 *
 * @param cwd Project working directory.
 * @returns Session directory and file path.
 */
async function createResumeSessionFixture(cwd: string): Promise<{ sessionDir: string; sessionPath: string }> {
  const sessionDir = await mkdtemp(join(tmpdir(), "nexus-startup-resume-session-"));
  const manager = SessionManager.create(cwd, sessionDir);
  manager.appendSessionInfo("Resume target");
  manager.appendMessage({ role: "user", content: [{ type: "text", text: "Resume me." }], timestamp: Date.now() } as never);
  return { sessionDir, sessionPath: manager.getSessionFile()! };
}

/**
 * Creates the minimum theme required by PromptlineEditor.
 *
 * @returns Theme stub.
 */
function createEditorTheme() {
  return {
    borderColor(value: string): string {
      return value;
    },
    selectList: {
      noMatch(value: string): string {
        return value;
      },
      selectedText(value: string): string {
        return value;
      },
      description(value: string): string {
        return value;
      },
      scrollInfo(value: string): string {
        return value;
      },
    },
  };
}

/**
 * Creates the minimum TUI host required by PromptlineEditor.
 *
 * @returns TUI stub.
 */
function createTui() {
  return {
    requestRender(): void {
      return undefined;
    },
    showOverlay(): { hide: () => void; focus: () => void; isFocused: () => boolean } {
      return {
        hide(): void {
          return undefined;
        },
        focus(): void {
          return undefined;
        },
        isFocused(): boolean {
          return true;
        },
      };
    },
  };
}
test.afterEach(() => {
  clearPromptlineConfig();
  clearTriggerSession();
});

test("startup resume selection refreshes the cached promptline trigger config before primed submit", async () => {
  const originalAgentDir = process.env.NEXUS_CODING_AGENT_DIR;
  const originalPiAgentDir = process.env.PI_CODING_AGENT_DIR;
  const originalList = SessionManager.list;
  const { cwd, agentDir } = await createConfigSandbox();
  const { sessionDir, sessionPath } = await createResumeSessionFixture(cwd);
  const submitted: string[] = [];
  try {
    process.env.NEXUS_CODING_AGENT_DIR = agentDir;
    process.env.PI_CODING_AGENT_DIR = agentDir;
    await refreshPromptlineConfig(cwd);

    const editor = new PromptlineEditor(
      createTui() as never,
      createEditorTheme() as never,
      { matches: () => false } as never,
      {
        cwd,
        model: "gpt-5.4",
        ui: {
          theme: createTestTheme(),
          notify(): void {
            return undefined;
          },
        },
        sessionManager: {
          getEntries(): [] {
            return [];
          },
          getTree(): [] {
            return [];
          },
          getSessionDir(): string {
            return sessionDir;
          },
        },
      } as never,
      createTestTheme() as never,
      () => "medium",
      () => undefined,
      () => "Untitled session",
      getPromptlineConfig,
      refreshPromptlineConfig,
    );
    editor.onSubmit = (value: string) => {
      submitted.push(value);
    };

    (SessionManager as unknown as { list: typeof SessionManager.list }).list = async () => [{
      path: sessionPath,
      name: "Resume target",
      modified: new Date(),
    }];

    await showStartupResumeModal({
      hasUI: true,
      cwd,
      sessionManager: {
        getSessionDir(): string {
          return sessionDir;
        },
      },
      ui: {
        theme: createTestTheme(),
        notify(): void {
          return undefined;
        },
        setEditorText(value: string): void {
          editor.setText(value);
        },
        async custom(factory: (tui: unknown, theme: unknown, keybindings: unknown, done: () => void) => { openLevel(level: "resume"): Promise<void>; handleInput(data: string): void }): Promise<void> {
          const modal = factory(createTui(), createTestTheme(), {}, () => undefined);
          await modal.openLevel("resume");
          modal.handleInput("\r");
          await flushAsyncWork();
        },
      },
    } as never);

    await flushAsyncWork();

    assert.equal(submitted.length, 1);
    assert.match(submitted[0]!, /^\/nexus-resume-select\s+/);
    assert.equal(editor.getText(), "");
  } finally {
    (SessionManager as unknown as { list: typeof SessionManager.list }).list = originalList;
    if (originalAgentDir === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
    else process.env.NEXUS_CODING_AGENT_DIR = originalAgentDir;
    if (originalPiAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = originalPiAgentDir;
    await rm(cwd, { recursive: true, force: true });
    await rm(agentDir, { recursive: true, force: true });
    await rm(sessionDir, { recursive: true, force: true });
  }
});
