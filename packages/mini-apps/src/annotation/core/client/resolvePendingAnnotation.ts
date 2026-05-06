import type { StoredAnnotation } from "../store/types.js";
import { postAnnotationAction } from "./postAnnotationAction.js";

/**
 * Resolves one annotation through the daemon API.
 *
 * @param annotationId Annotation identifier.
 * @param owner Worker or chat identifier.
 * @returns Resolved annotation record.
 */
export async function resolvePendingAnnotation(annotationId: string, owner: string): Promise<StoredAnnotation> {
  return postAnnotationAction(annotationId, "resolve", owner);
}
