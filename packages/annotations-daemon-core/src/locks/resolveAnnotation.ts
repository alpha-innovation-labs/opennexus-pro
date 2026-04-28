import { readAnnotationStore } from "../store/readAnnotationStore.js";
import type { StoredAnnotation } from "../store/types.js";
import { writeAnnotationStore } from "../store/writeAnnotationStore.js";
import { findAnnotationIndex } from "./findAnnotationIndex.js";

/**
 * Marks an annotation as resolved.
 *
 * @param annotationId Annotation identifier.
 * @param owner Worker or chat identifier resolving the annotation.
 * @returns Resolved annotation record.
 */
export async function resolveAnnotation(annotationId: string, owner: string): Promise<StoredAnnotation> {
  const store = await readAnnotationStore();
  const index = findAnnotationIndex(store, annotationId);
  if (index < 0) throw new Error("Annotation not found");

  const annotation = store.annotations[index];
  if (annotation.status === "claimed" && annotation.claimedBy !== owner) {
    throw new Error(`Annotation claimed by ${annotation.claimedBy ?? "another worker"}`);
  }

  const now = new Date().toISOString();
  store.annotations[index] = { ...annotation, status: "resolved", resolvedBy: owner, resolvedAt: now, updatedAt: now };
  await writeAnnotationStore(store);
  return store.annotations[index];
}
