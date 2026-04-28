import { readAnnotationStore } from "./readAnnotationStore.js";
import type { StoredAnnotation, StoredAnnotationStatus } from "./types.js";

/**
 * Lists annotations from the durable store.
 *
 * @param status Optional status filter.
 * @returns Matching annotation records.
 */
export async function listAnnotations(status?: StoredAnnotationStatus): Promise<StoredAnnotation[]> {
  const store = await readAnnotationStore();
  if (!status) return store.annotations;
  return store.annotations.filter((annotation) => annotation.status === status);
}
