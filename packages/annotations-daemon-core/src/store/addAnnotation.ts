import { randomUUID } from "node:crypto";
import type { AnnotationResult } from "@nexus/extensions/annotate/types.js";
import { readAnnotationStore } from "./readAnnotationStore.js";
import type { StoredAnnotation } from "./types.js";
import { writeAnnotationStore } from "./writeAnnotationStore.js";

/**
 * Adds a captured browser annotation to the pending store.
 *
 * @param result Annotation result emitted by the Chrome extension.
 * @returns Stored annotation record.
 */
export async function addAnnotation(result: AnnotationResult): Promise<StoredAnnotation> {
  const store = await readAnnotationStore();
  const now = new Date().toISOString();
  const annotation: StoredAnnotation = {
    id: randomUUID(),
    status: "pending",
    result,
    createdAt: now,
    updatedAt: now,
  };

  store.annotations.push(annotation);
  await writeAnnotationStore(store);
  return annotation;
}
