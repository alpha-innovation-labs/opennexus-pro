import assert from "node:assert/strict";
import test from "node:test";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { AtModal } from "../../../packages/extension-core/src/neo-editor/features/promptline/AtModal.js";
import { SlashMenuModal } from "../../../packages/extension-core/src/slash-menu/SlashMenuModal.js";
import { clearRegisteredSlashCommands } from "../../../packages/extension-core/src/slash-menu/registerSlashCommand.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum extension context for slash-modal tests.
 *
 * @returns Fake extension context.
 */
function createContext() {
  return {
    cwd: process.cwd(),
    sessionManager: {
      getEntries() {
        return [
          {
            id: "entry-1",
            type: "message",
            message: {
              role: "user",
              content: "First fork prompt should sit beside the number",
            },
          },
        ];
      },
      getSessionName() {
        return "Test session";
      },
      getSessionId() {
        return "session-1";
      },
      getSessionDir() {
        return "/tmp/nexus-sessions";
      },
      getSessionFile() {
        return "/tmp/nexus-sessions/session-1.jsonl";
      },
      getLeafId() {
        return "entry-1";
      },
    },
    ui: {
      theme: createTestTheme(),
      notify: () => undefined,
      custom: async () => undefined,
    },
  };
}

test.beforeEach(() => {
  clearRegisteredSlashCommands();
});

test.after(() => {
  clearRegisteredSlashCommands();
});

test("slash modal filters commands immediately outside tree and closes on ctrl+c", async () => {
  let closed = false;
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => {
    closed = true;
  }, () => undefined, () => undefined);

  await modal.refresh();
  modal.handleInput("f");
  modal.handleInput("o");
  modal.handleInput("r");
  const filteredView = await renderComponentInVirtualTerminal(() => modal, 120, 30);
  modal.handleInput("\u0003");

  const rendered = filteredView.join("\n");
  assert.match(rendered, /fork/);
  assert.doesNotMatch(rendered, /settings/u);
  assert.doesNotMatch(rendered, /\/fork/);
  assert.equal(closed, true);
});

test("slash modal shows the tree command in the top-level menu", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  await modal.refresh();
  const topView = await renderComponentInVirtualTerminal(() => modal, 120, 30);
  modal.handleInput("t");
  modal.handleInput("r");
  modal.handleInput("e");
  modal.handleInput("e");
  const filteredView = await renderComponentInVirtualTerminal(() => modal, 120, 30);

  assert.match(topView.join("\n"), /Navigate session tree/u);
  assert.match(filteredView.join("\n"), /Navigate session tree/u);
});

test("slash session opens the Nexus-owned session info modal", async () => {
  let customOpened = false;
  let submitted = "";
  const ctx = createContext();
  ctx.ui.custom = async () => {
    customOpened = true;
  };
  const modal = new SlashMenuModal(ctx as never, () => "medium", () => undefined, () => undefined, () => undefined, (command) => {
    submitted = command;
  });

  await modal.refresh();
  for (const char of "session") modal.handleInput(char);
  modal.handleInput("\r");

  assert.equal(customOpened, true);
  assert.equal(submitted, "");
});

test("fork modal renders message text directly beside the fork number", async () => {
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

  await modal.openLevel("fork");
  const view = await renderComponentInVirtualTerminal(() => modal, 140, 24);
  const rendered = view.join("\n");

  assert.match(rendered, /#1 First fork prompt should sit beside the number/u);
  assert.doesNotMatch(rendered, /#1\s{8,}First fork prompt/u);
});

test("resume modal renders as fullscreen width and height", async () => {
  const originalRows = process.stdout.rows;
  const originalList = SessionManager.list;
  process.stdout.rows = 18;
  (SessionManager as any).list = async () => [{ path: "/tmp/session.jsonl", name: "Resume target", modified: new Date() }];
  try {
    const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined);

    await modal.openLevel("resume");
    const view = await renderComponentInVirtualTerminal(() => modal, 100, 18);

    assert.equal(view.length, 18);
    assert.equal(view[0]?.startsWith("┌"), true);
    assert.equal(view[0]?.length, 100);
    assert.match(view.join("\n"), /Resume target/u);
  } finally {
    process.stdout.rows = originalRows;
    (SessionManager as any).list = originalList;
  }
});

test("at modal keeps navigation inside the picker in the virtual terminal", async () => {
  const modal = new AtModal(process.cwd(), createTestTheme() as never, () => undefined, () => undefined, () => undefined);
  modal.setQuery("src");
  modal.setItems([
    { value: "@alpha.ts", label: "@alpha.ts", description: "alpha" },
    { value: "@beta.ts", label: "@beta.ts", description: "beta" },
  ]);

  const firstView = await renderComponentInVirtualTerminal(() => modal, 120, 30);
  modal.handleInput("\u000e");
  const secondView = await renderComponentInVirtualTerminal(() => modal, 120, 30);

  assert.match(firstView.join("\n"), /@alpha\.ts/);
  assert.match(secondView.join("\n"), /@beta\.ts/);
});
