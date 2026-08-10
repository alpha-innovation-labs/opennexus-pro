import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createUserMessageSignature } from "./createUserMessageSignature.ts";
import type { UserMessageMetadata } from "./types.ts";

/**
 * Creates timestamp metadata in the same order user messages are rendered for the active branch.
 *
 * @param ctx Extension context for the active session.
 * @returns Ordered user-message timestamp metadata queue.
 */
export function createUserMessageMetadataQueueFromSession(ctx: ExtensionContext): UserMessageMetadata[] {
  const branch = ctx.sessionManager.getBranch(ctx.sessionManager.getLeafId() ?? undefined);
  const renderedUserSignatures = getRenderedUserSignatures(ctx);
  const renderedCounts = new Map<string, number>();
  const queue: UserMessageMetadata[] = [];

  for (const entry of branch) {
    if (entry.type !== "message" || entry.message.role !== "user") continue;
    const signature = createUserMessageSignature(entry.message);
    const remaining = renderedUserSignatures.get(signature) ?? 0;
    const consumed = renderedCounts.get(signature) ?? 0;
    if (consumed >= remaining) continue;
    renderedCounts.set(signature, consumed + 1);
    queue.push({ timestamp: (entry.message as any).timestamp ?? entry.timestamp });
  }

  return queue;
}

/**
 * Counts user messages that are present in the rendered session context.
 *
 * @param ctx Extension context for the active session.
 * @returns Signature counts for rendered user messages.
 */
function getRenderedUserSignatures(ctx: ExtensionContext): Map<string, number> {
  const signatures = new Map<string, number>();
  const sessionContext = (ctx.sessionManager as any).buildSessionContext?.();
  const messages = Array.isArray(sessionContext?.messages) ? sessionContext.messages : [];
  for (const message of messages) {
    if (message.role !== "user") continue;
    const signature = createUserMessageSignature(message);
    signatures.set(signature, (signatures.get(signature) ?? 0) + 1);
  }
  return signatures;
}
