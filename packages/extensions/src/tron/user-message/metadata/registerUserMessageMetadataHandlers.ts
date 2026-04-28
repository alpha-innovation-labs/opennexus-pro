import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createCurrentUserMessageMetadata } from "./createCurrentUserMessageMetadata.ts";
import { createUserMessageMetadataQueueFromSession } from "./createUserMessageMetadataQueueFromSession.ts";
import { enqueueUserMessageMetadata, resetPendingUserMessageMetadata } from "./userMessageMetadataStore.ts";

/**
 * Registers lifecycle handlers that feed prompt metadata to the Tron renderer.
 *
 * @param pi Pi extension API.
 */
export function registerUserMessageMetadataHandlers(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    resetPendingUserMessageMetadata(createUserMessageMetadataQueueFromSession(ctx));
  });

  pi.on("session_tree", (_event, ctx) => {
    resetPendingUserMessageMetadata(createUserMessageMetadataQueueFromSession(ctx));
  });

  pi.on("session_compact", (_event, ctx) => {
    resetPendingUserMessageMetadata(createUserMessageMetadataQueueFromSession(ctx));
  });

  pi.on("message_start", (event) => {
    if (event.message.role !== "user") return;
    enqueueUserMessageMetadata(createCurrentUserMessageMetadata(event.message));
  });
}
