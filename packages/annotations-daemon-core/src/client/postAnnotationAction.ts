import type { StoredAnnotation } from "../store/types.js";
import { getAnnotationsDaemonBaseUrl } from "./getAnnotationsDaemonBaseUrl.js";
import { readDaemonResponse } from "./readDaemonResponse.js";

/**
 * Posts a mutation action for one annotation.
 *
 * @param annotationId Annotation identifier.
 * @param action Mutation action.
 * @param owner Worker or chat identifier.
 * @returns Updated annotation record.
 */
export async function postAnnotationAction(annotationId: string, action: "claim" | "resolve", owner: string): Promise<StoredAnnotation> {
  const response = await fetch(`${getAnnotationsDaemonBaseUrl()}/annotations/${encodeURIComponent(annotationId)}/${action}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ owner }),
  });
  const body = await readDaemonResponse<{ annotation: StoredAnnotation }>(response);
  return body.annotation;
}
