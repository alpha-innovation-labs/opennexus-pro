import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createForkLeaves } from "./createForkLeaves.js";
import { createOAuthProviderLeaves } from "./createOAuthProviderLeaves.js";
import { createTreeLeaves } from "./createTreeLeaves.js";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";

/**
 * Handles an enter key selection from the top-level slash menu.
 *
 * @param ctx Extension context.
 * @param value Selected item value.
 * @param openLevel Submenu opener.
 * @param onCommandPicked Command submit callback.
 */
export async function handleTopLevelMenuEnter(
  ctx: ExtensionContext,
  value: string,
  openLevel: (level: SlashMenuLevel) => Promise<void>,
  onCommandPicked: (commandText: string) => void,
): Promise<void> {
  if (value === "settings") return openLevel("settings");
  if (value === "model") return openLevel("model");
  if (value === "scoped-models") return openLevel("scoped-models");
  if (value === "fork") {
    const leaves = createForkLeaves(ctx.sessionManager.getEntries() as never);
    if (leaves.length === 0) {
      ctx.ui.notify("No messages to fork from", "info");
      return;
    }
    return openLevel("fork");
  }
  if (value === "tree") {
    const leaves = createTreeLeaves(ctx.sessionManager.getTree() as never);
    if (leaves.length === 0) {
      ctx.ui.notify("No entries in session", "info");
      return;
    }
    return openLevel("tree");
  }
  if (value === "resume") return openLevel("resume");
  if (value === "login") return openLevel("login");
  if (value === "logout") {
    const leaves = createOAuthProviderLeaves(ctx, "logout");
    if (leaves.length === 0) {
      ctx.ui.notify("No OAuth providers logged in. Use /login first.", "info");
      return;
    }
    return openLevel("logout");
  }
  onCommandPicked(`/${value}`);
}
