import type { AnnotationStore } from "./types.js";

/**
 * Creates an empty annotations store document.
 *
 * @returns Empty annotation store.
 */
export function createEmptyAnnotationStore(): AnnotationStore {
  return { annotations: [] };
}
