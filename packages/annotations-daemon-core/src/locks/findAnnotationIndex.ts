import type { AnnotationStore } from "../store/types.js";

/**
 * Finds the index of one annotation record in a store.
 *
 * @param store Store to inspect.
 * @param annotationId Annotation identifier.
 * @returns Matching index, or -1 when absent.
 */
export function findAnnotationIndex(store: AnnotationStore, annotationId: string): number {
  return store.annotations.findIndex((annotation) => annotation.id === annotationId);
}
