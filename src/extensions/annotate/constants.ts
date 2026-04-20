/** Path to the Unix socket exposed by the native host. */
export const SOCKET_PATH = "/tmp/pi-annotate.sock";

/** Path to the auth token created by the native host. */
export const TOKEN_PATH = "/tmp/pi-annotate.token";

/** Max buffered socket bytes before the connection is dropped. */
export const MAX_SOCKET_BUFFER = 32 * 1024 * 1024;

/** Max screenshot payload size accepted by the formatter. */
export const MAX_SCREENSHOT_BYTES = 15 * 1024 * 1024;
