import { randomUUID } from "node:crypto";
import type { AnnotationResult } from "@nexus/mini-apps/annotate/types.js";
import { createAnnotationConversationEvent } from "./createAnnotationConversationEvent.js";
import { describeAnnotationTarget } from "./describeAnnotationTarget.js";
import { findConversationByUrl } from "./findConversationByUrl.js";
import { getAnnotationResultUrl } from "./getAnnotationResultUrl.js";
import { getAnnotationResultWorkspaceDir } from "./getAnnotationResultWorkspaceDir.js";
import { readAnnotationConversationStore } from "./readAnnotationConversationStore.js";
import type { AnnotationConversation } from "./types.js";
import { withAnnotationConversationStoreLock } from "./withAnnotationConversationStoreLock.js";
import { writeAnnotationConversationStore } from "./writeAnnotationConversationStore.js";

/**
 * Creates or updates the page conversation for one submitted annotation.
 *
 * @param annotationId Stored annotation id.
 * @param result Annotation result posted by the browser extension.
 * @returns Updated conversation.
 */
export async function upsertAnnotationConversation(annotationId: string, result: AnnotationResult): Promise<AnnotationConversation> {
  return withAnnotationConversationStoreLock(async () => {
    const store = await readAnnotationConversationStore();
    const url = getAnnotationResultUrl(result);
    const workspaceDir = getAnnotationResultWorkspaceDir(result);
    const existing = findConversationByUrl(store.conversations, url);
    const now = new Date().toISOString();

    if (existing) {
      existing.annotationIds.push(annotationId);
      if (workspaceDir) existing.workspaceDir = workspaceDir;
      existing.events.push(createAnnotationConversationEvent("user", `Follow-up submitted: ${describeAnnotationTarget(result)}`));
      existing.updatedAt = now;
      await writeAnnotationConversationStore(store);
      return existing;
    }

    const conversation: AnnotationConversation = {
      id: randomUUID(),
      url,
      workspaceDir,
      annotationIds: [annotationId],
      events: [createAnnotationConversationEvent("user", `Annotation submitted: ${describeAnnotationTarget(result)}`)],
      createdAt: now,
      updatedAt: now,
    };
    store.conversations.push(conversation);
    await writeAnnotationConversationStore(store);
    return conversation;
  });
}
