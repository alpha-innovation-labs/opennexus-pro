/**
 * Parses a daemon response and throws on HTTP failure.
 *
 * @param response Fetch response from the daemon.
 * @returns Parsed JSON body.
 */
export async function readDaemonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    const error = typeof body?.error === "string" ? body.error : `Daemon request failed: ${response.status}`;
    throw new Error(error);
  }
  return body as T;
}
