import { readAnnotationStore } from "../store/readAnnotationStore.js";
import type { StoredAnnotation } from "../store/types.js";
import { writeAnnotationStore } from "../store/writeAnnotationStore.js";
import { findAnnotationIndex } from "./findAnnotationIndex.js";

/**
 * Claims a pending annotation for one worker/chat.
 *
 * @param annotationId Annotation identifier.
 * @param owner Worker or chat identifier claiming the annotation.
 * @returns Claimed annotation record.
 */
export async function claimAnnotation(annotationId: string, owner: string): Promise<StoredAnnotation> {
  const store = await readAnnotationStore();
  const index = findAnnotationIndex(store, annotationId);
  if (index < 0) throw new Error("Annotation not found");

  const annotation = store.annotations[index];
  if (annotation.status === "resolved") throw new Error("Annotation already resolved");
  if (annotation.status === "claimed" && annotation.claimedBy !== owner) {
    throw new Error(`Annotation already claimed by ${annotation.claimedBy ?? "another worker"}`);
  }

  const now = new Date().toISOString();
  store.annotations[index] = { ...annotation, status: "claimed", claimedBy: owner, claimedAt: annotation.claimedAt ?? now, updatedAt: now };
  await writeAnnotationStore(store);
  return store.annotations[index];
}
