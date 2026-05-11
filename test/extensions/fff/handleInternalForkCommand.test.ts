import assert from "node:assert/strict";
import test from "node:test";
import { handleInternalForkCommand } from "../../../packages/extension-core/src/slash-menu/internal-commands/handleInternalForkCommand.js";

test("handleInternalForkCommand updates editor and notification from the replacement session context", async () => {
  const notifications: Array<{ text: string; level: string }> = [];
  const editorUpdates: string[] = [];
  let forkedEntryId: string | undefined;
  let oldContextUiUsed = false;

  await handleInternalForkCommand(
    "entry-1",
    {
      sessionManager: {
        getEntry(id: string) {
          assert.equal(id, "entry-1");
          return {
            id,
            type: "message",
            message: {
              role: "user",
              content: [{ type: "text", text: "restore me" }],
            },
          };
        },
      },
      async fork(entryId: string, options?: { withSession?: (ctx: { ui: { notify: (text: string, level: string) => void; setEditorText: (text: string) => void } }) => Promise<void> }) {
        forkedEntryId = entryId;
        await options?.withSession?.({
          ui: {
            notify(text: string, level: string): void {
              notifications.push({ text, level });
            },
            setEditorText(text: string): void {
              editorUpdates.push(text);
            },
          },
        });
        return { cancelled: false, selectedText: "restore me" };
      },
      ui: {
        notify(): void {
          oldContextUiUsed = true;
          throw new Error("old context notify was used");
        },
        setEditorText(): void {
          oldContextUiUsed = true;
          throw new Error("old context editor was used");
        },
      },
    } as never,
    {} as never,
  );

  assert.equal(forkedEntryId, "entry-1");
  assert.equal(oldContextUiUsed, false);
  assert.deepEqual(editorUpdates, ["restore me"]);
  assert.deepEqual(notifications, [{ text: "Forked to new session", level: "info" }]);
});

test("handleInternalForkCommand does not update replacement UI when fork is cancelled", async () => {
  let replacementUiUsed = false;

  await handleInternalForkCommand(
    "entry-1",
    {
      sessionManager: {
        getEntry() {
          return {
            type: "message",
            message: { role: "user", content: "restore me" },
          };
        },
      },
      async fork() {
        return { cancelled: true };
      },
      ui: {
        notify(): void {
          throw new Error("old context notify was used");
        },
        setEditorText(): void {
          throw new Error("old context editor was used");
        },
      },
    } as never,
    {} as never,
  );

  assert.equal(replacementUiUsed, false);
});
