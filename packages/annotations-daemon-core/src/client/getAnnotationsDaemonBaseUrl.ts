import { ANNOTATIONS_DAEMON_HOST, ANNOTATIONS_DAEMON_PORT } from "../shared/constants.js";

/**
 * Resolves the local annotations daemon base URL.
 *
 * @returns Local HTTP base URL.
 */
export function getAnnotationsDaemonBaseUrl(): string {
  return `http://${ANNOTATIONS_DAEMON_HOST}:${ANNOTATIONS_DAEMON_PORT}`;
}
