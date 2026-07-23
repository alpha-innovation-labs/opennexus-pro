import type { StoredAnnotation } from "../store/types.js";
import { postAnnotationAction } from "./postAnnotationAction.js";

/**
 * Claims one pending annotation through the daemon API.
 *
 * @param annotationId Annotation identifier.
 * @param owner Worker or chat identifier.
 * @returns Claimed annotation record.
 */
export async function claimPendingAnnotation(annotationId: string, owner: string): Promise<StoredAnnotation> {
  return postAnnotationAction(annotationId, "claim", owner);
}
