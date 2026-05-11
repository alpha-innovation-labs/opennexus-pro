import type { ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";

/**
 * Reads current branch messages from the live session manager.
 *
 * @param ctx Extension context.
 * @returns Branch message payloads.
 */
export function getBranchMessages(ctx: ExtensionContext | ExtensionCommandContext): unknown[] {
  const messages: unknown[] = [];
  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type === "message") messages.push(entry.message);
  }
  return messages;
}
