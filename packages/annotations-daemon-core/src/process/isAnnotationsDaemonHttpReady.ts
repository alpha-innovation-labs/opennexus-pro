import { getAnnotationsDaemonBaseUrl } from "../client/getAnnotationsDaemonBaseUrl.js";

/**
 * Checks whether the daemon HTTP API is accepting requests.
 *
 * @returns True when the health endpoint responds OK.
 */
export async function isAnnotationsDaemonHttpReady(): Promise<boolean> {
  try {
    const response = await fetch(`${getAnnotationsDaemonBaseUrl()}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
