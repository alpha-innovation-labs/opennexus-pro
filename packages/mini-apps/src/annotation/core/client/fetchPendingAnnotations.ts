import type { StoredAnnotation } from "../store/types.js";
import { getAnnotationsDaemonBaseUrl } from "./getAnnotationsDaemonBaseUrl.js";
import { readDaemonResponse } from "./readDaemonResponse.js";

/**
 * Fetches pending annotations from the daemon.
 *
 * @returns Pending annotation records.
 */
export async function fetchPendingAnnotations(): Promise<StoredAnnotation[]> {
  const response = await fetch(`${getAnnotationsDaemonBaseUrl()}/annotations?status=pending`);
  const body = await readDaemonResponse<{ annotations: StoredAnnotation[] }>(response);
  return body.annotations;
}
