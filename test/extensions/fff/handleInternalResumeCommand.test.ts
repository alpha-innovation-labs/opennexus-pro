import assert from "node:assert/strict";
import test from "node:test";
import { handleInternalResumeCommand } from "../../../packages/extension-core/src/slash-menu/internal-commands/handleInternalResumeCommand.js";

/**
 * Encodes a slash command argument the same way the slash menu does for paths.
 *
 * @param value Raw command argument value.
 * @returns Base64-url encoded command argument.
 */
function encodeBase64Arg(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

test("handleInternalResumeCommand notifies from the replacement session context", async () => {
  const sessionPath = "/tmp/nexus-session.jsonl";
  const notifications: Array<{ text: string; level: string }> = [];
  let selectedSessionPath: string | undefined;
  let oldContextNotifyUsed = false;

  await handleInternalResumeCommand(
    encodeBase64Arg(sessionPath),
    {
      async switchSession(path: string, options?: { withSession?: (ctx: { ui: { notify: (text: string, level: string) => void } }) => Promise<void> }) {
        selectedSessionPath = path;
        await options?.withSession?.({
          ui: {
            notify(text: string, level: string): void {
              notifications.push({ text, level });
            },
          },
        });
        return { cancelled: false };
      },
      ui: {
        notify(): void {
          oldContextNotifyUsed = true;
        },
      },
    } as never,
    {} as never,
  );

  assert.equal(selectedSessionPath, sessionPath);
  assert.equal(oldContextNotifyUsed, false);
  assert.deepEqual(notifications, [{ text: "Resumed session", level: "info" }]);
});

test("handleInternalResumeCommand does not notify when the session switch is cancelled", async () => {
  let oldContextNotifyUsed = false;

  await handleInternalResumeCommand(
    encodeBase64Arg("/tmp/cancelled-session.jsonl"),
    {
      async switchSession() {
        return { cancelled: true };
      },
      ui: {
        notify(): void {
          oldContextNotifyUsed = true;
        },
      },
    } as never,
    {} as never,
  );

  assert.equal(oldContextNotifyUsed, false);
});
